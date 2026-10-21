const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

function load(file, imports, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const context = { exports: {}, require: name => {
    assert.ok(name in imports, `Unexpected import: ${name}`)
    return imports[name]
  }, ...globals }
  vm.runInNewContext(code, context, { filename: file })
  return context.exports
}
const tick = () => new Promise(resolve => setImmediate(resolve))
const review = (phase, no = 1) => ({ id: 'r', tenantId: 't', versions: [{ no,
  status: phase === 'analysis' ? 'analyzing' : 'done',
  approval: { state: 'approved', agentResume: phase === 'resume' ? 'pending' : 'completed' },
}] })
function streamHarness() {
  const connections = [], timers = [], events = [], closes = []
  const api = load('src/shared/api/reviewEvents.ts', {
    './http': { requestRaw: async (_path, options) => {
      const connection = { options }
      const body = new ReadableStream({ start(controller) { connection.controller = controller } })
      connections.push(connection)
      return { body }
    } },
  }, { AbortController, TextDecoderStream, Date,
    setTimeout: fn => { timers.push(fn); return timers.length }, clearTimeout: () => {} })
  const stop = api.openReviewStream('r', { onEvent: e => events.push(e.type), onClose: r => closes.push(r) })
  const send = (type, data, id = 1) => connections.at(-1).controller.enqueue(new TextEncoder().encode(
    `event:${type}\nid:${id}\ndata:${JSON.stringify(data)}\n\n`))
  return { connections, timers, events, closes, stop, send }
}

test('resume ignores replayed analysis completion and reconnects after EOF', async () => {
  const h = streamHarness()
  h.send('snapshot', review('resume'))
  h.send('completed', { versionNo: 1 }, 8)
  h.connections[0].controller.close()
  await tick(); await tick()
  assert.deepEqual(h.events, ['snapshot'])
  assert.deepEqual(h.closes, [])
  assert.equal(h.timers.length, 1)
  h.timers.shift()()
  await tick()
  assert.equal(h.connections.length, 2)
  assert.equal(h.connections[1].options.headers['Last-Event-ID'], '8')
  h.stop()
})

test('resume completion and failure each close the stream immediately', async () => {
  for (const type of ['resume_completed', 'resume_failed']) {
    const h = streamHarness()
    h.send('snapshot', review('resume'))
    h.send(type, { versionNo: 1 })
    await tick(); await tick()
    assert.deepEqual(h.events, ['snapshot', type])
    assert.deepEqual(h.closes, ['finished'])
    assert.equal(h.connections[0].options.signal.aborted, true)
  }
})

test('an older version cannot terminate a current analysis', async () => {
  const h = streamHarness()
  h.send('snapshot', review('analysis', 2))
  h.send('completed', { versionNo: 1 })
  h.send('resume_failed', { versionNo: 1 })
  h.send('completed', { versionNo: 2 })
  await tick(); await tick()
  assert.deepEqual(h.events, ['snapshot', 'completed'])
  assert.deepEqual(h.closes, ['finished'])
})

test('a settled snapshot ends a refreshed page subscription', async () => {
  const h = streamHarness()
  h.send('snapshot', review('done'))
  await tick(); await tick()
  assert.deepEqual(h.closes, ['finished'])
})

test('explicit cancellation never requests reconnection', async () => {
  const h = streamHarness()
  h.stop()
  assert.deepEqual(h.closes, ['cancelled'])
  assert.equal(h.timers.length, 0)
})

function storeHarness() {
  const session = { isAuthenticated: true, tenant: { id: 't' }, user: { id: 'u' } }
  const subscriptions = [], timers = []
  let response = review('analysis'), fail = false
  const storeModule = load('src/shared/stores/reviews.js', {
    pinia: { defineStore: (_name, setup) => setup },
    vue: { ref: value => ({ value }), computed: fn => ({ get value() { return fn() } }), watch: () => {} },
    '@/shared/api/http': { request: async () => { if (fail) throw Error('offline'); return response } },
    '@/shared/api/reviewEvents': { openReviewStream: (_id, handlers) => { subscriptions.push(handlers); return () => handlers.onClose('cancelled') } },
    './session': { useSessionStore: () => session },
    './credits': { useCreditsStore: () => ({ loadBalance: async () => {} }) },
    '@/shared/i18n': { t: key => key },
  }, { setTimeout: fn => { timers.push(fn); return timers.length }, clearTimeout: () => {} })
  return { store: storeModule.useReviewsStore(), subscriptions, timers, session,
    respond: value => { response = value }, fail: value => { fail = value } }
}

test('automatic approval opens resume subscription after analysis subscription cleanup', async () => {
  const h = storeHarness()
  await h.store.refresh('r'); await h.store.poll()
  assert.equal(h.subscriptions.length, 1)
  h.respond(review('resume'))
  h.subscriptions[0].onEvent({ type: 'completed', data: { versionNo: 1 } })
  await h.subscriptions[0].onClose('finished')
  await tick()
  assert.equal(h.subscriptions.length, 2)
  h.respond(review('done'))
  await h.subscriptions[1].onClose('finished')
  assert.equal(h.subscriptions.length, 2)
  assert.equal(h.store.byId('r').versions[0].approval.agentResume, 'completed')
})

test('failed final state fetch falls back to polling and recovers', async () => {
  const h = storeHarness()
  h.respond(review('resume'))
  await h.store.refresh('r'); await h.store.poll()
  h.fail(true)
  await h.subscriptions[0].onClose('finished'); await tick()
  assert.ok(h.timers.length > 0)
  h.fail(false); h.respond(review('done'))
  await h.timers.shift()()
  assert.equal(h.store.byId('r').versions[0].approval.agentResume, 'completed')
})

test('manual approval subscribes to resume; cancelled subscription stays closed', async () => {
  const h = storeHarness()
  h.respond(review('resume'))
  await h.store.decide('r', 1, 'approved', '')
  assert.equal(h.subscriptions.length, 1)
  await h.subscriptions[0].onClose('cancelled')
  assert.equal(h.subscriptions.length, 1)
  assert.equal(h.timers.length, 0)
})
