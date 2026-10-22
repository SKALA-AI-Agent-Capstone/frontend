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
}] })
// 승인을 없애기 전(2026-10-22)에 저장된 문서. 결정 뒤 Agent 재개를 기다리던 상태가 남아 있을 수 있다.
const legacyPendingResume = () => ({ id: 'r', tenantId: 't', versions: [{ no: 1, status: 'done',
  approval: { state: 'approved', agentResume: 'pending' } }] })
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

test('an analysis stream reconnects after EOF from the last event id', async () => {
  const h = streamHarness()
  h.send('snapshot', review('analysis'))
  h.send('step_done', { versionNo: 1, step: 0 }, 8)
  h.connections[0].controller.close()
  await tick(); await tick()
  assert.deepEqual(h.events, ['snapshot', 'step_done'])
  assert.deepEqual(h.closes, [])
  assert.equal(h.timers.length, 1)
  h.timers.shift()()
  await tick()
  assert.equal(h.connections.length, 2)
  assert.equal(h.connections[1].options.headers['Last-Event-ID'], '8')
  h.stop()
})

test('analysis completion and failure each close the stream immediately', async () => {
  for (const type of ['completed', 'failed']) {
    const h = streamHarness()
    h.send('snapshot', review('analysis'))
    h.send(type, { versionNo: 1 })
    await tick(); await tick()
    assert.deepEqual(h.events, ['snapshot', type])
    assert.deepEqual(h.closes, ['finished'])
    assert.equal(h.connections[0].options.signal.aborted, true)
  }
})

test('a legacy pending resume no longer keeps a finished review open', async () => {
  const h = streamHarness()
  h.send('snapshot', legacyPendingResume())
  await tick(); await tick()
  assert.deepEqual(h.closes, ['finished'])
})

test('an older version cannot terminate a current analysis', async () => {
  const h = streamHarness()
  h.send('snapshot', review('analysis', 2))
  h.send('completed', { versionNo: 1 })
  h.send('failed', { versionNo: 1 })
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
  const subscriptions = [], timers = [], paths = []
  let response = review('analysis'), fail = false
  const storeModule = load('src/shared/stores/reviews.js', {
    pinia: { defineStore: (_name, setup) => setup },
    vue: { ref: value => ({ value }), computed: fn => ({ get value() { return fn() } }), watch: () => {} },
    '@/shared/api/http': { request: async (path) => { paths.push(path); if (fail) throw Error('offline'); return typeof response === 'function' ? response(path) : response } },
    '@/shared/api/reviewEvents': { openReviewStream: (_id, handlers) => { subscriptions.push(handlers); return () => handlers.onClose('cancelled') } },
    './session': { useSessionStore: () => session },
    './credits': { useCreditsStore: () => ({ loadBalance: async () => {} }) },
    '@/shared/i18n': { t: key => key },
  }, { setTimeout: fn => { timers.push(fn); return timers.length }, clearTimeout: () => {} })
  return { store: storeModule.useReviewsStore(), subscriptions, timers, session, paths,
    respond: value => { response = value }, fail: value => { fail = value } }
}

test('a finished analysis refreshes once and opens no further subscription', async () => {
  const h = storeHarness()
  await h.store.refresh('r'); await h.store.poll()
  assert.equal(h.subscriptions.length, 1)
  h.respond(review('done'))
  h.subscriptions[0].onEvent({ type: 'completed', data: { versionNo: 1 } })
  await h.subscriptions[0].onClose('finished')
  await tick()
  assert.equal(h.subscriptions.length, 1)
  assert.equal(h.store.byId('r').versions[0].status, 'done')
})

test('failed final state fetch falls back to polling and recovers', async () => {
  const h = storeHarness()
  await h.store.refresh('r'); await h.store.poll()
  h.fail(true)
  await h.subscriptions[0].onClose('finished'); await tick()
  assert.ok(h.timers.length > 0)
  h.fail(false); h.respond(review('done'))
  await h.timers.shift()()
  assert.equal(h.store.byId('r').versions[0].status, 'done')
})

test('a legacy pending resume is not followed or polled', async () => {
  const h = storeHarness()
  h.respond(legacyPendingResume())
  await h.store.refresh('r'); await h.store.poll()
  assert.equal(h.subscriptions.length, 0)
  assert.equal(h.timers.length, 0)
})

test('a cancelled subscription stays closed', async () => {
  const h = storeHarness()
  await h.store.refresh('r'); await h.store.poll()
  assert.equal(h.subscriptions.length, 1)
  await h.subscriptions[0].onClose('cancelled')
  assert.equal(h.subscriptions.length, 1)
  assert.equal(h.timers.length, 0)
})

// ── 목록 요약(view=summary)과 상세 ──
const detailed = (status = 'done') => ({ id: 'r', tenantId: 't', versions: [{ no: 1, status, result: { findings: [{ id: 'f', severity: 'high' }] } }], violations: [{ id: 'v' }], hitl: { violationCount: 1, undecidedCount: 1 } })
const summary = (status = 'done', undecided = 0) => ({ id: 'r', tenantId: 't', summary: true, versions: [{ no: 1, status, result: { findingCount: 1, severityCounts: { high: 1, medium: 0, low: 0 } } }], hitl: { violationCount: 1, undecidedCount: undecided } })

test('the list asks for the summary view', async () => {
  const h = storeHarness()
  h.respond([])
  await h.store.load()
  assert.deepEqual(h.paths, ['/reviews?view=summary'])
})

test('a summary does not overwrite a detailed review of the same state', async () => {
  const h = storeHarness()
  h.respond(detailed('done'))
  await h.store.refresh('r')
  h.respond([summary('done', 0)])
  await h.store.load()
  const kept = h.store.byId('r')
  assert.equal(h.store.isDetailed(kept), true)
  assert.equal(kept.versions[0].result.findings.length, 1)
  assert.equal(kept.violations.length, 1)
  assert.equal(kept.hitl.undecidedCount, 0)
})

test('a summary with a newer state replaces a stale detail', async () => {
  const h = storeHarness()
  h.respond(detailed('analyzing'))
  await h.store.refresh('r')
  h.respond([summary('done')])
  await h.store.load()
  assert.equal(h.store.isDetailed(h.store.byId('r')), false)
  assert.equal(h.store.byId('r').versions[0].status, 'done')
})

