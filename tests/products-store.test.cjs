// 제품 스토어(2026-10-22 제품 단위 검토)와 검토 접수의 productId 전달
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
  }, FormData, ...globals }
  vm.runInNewContext(code, context, { filename: file })
  return context.exports
}

const vue = { ref: value => ({ value }), computed: fn => ({ get value() { return fn() } }), watch: () => {} }
const session = { isAuthenticated: true, tenant: { id: 't' }, user: { id: 'u' } }

function productsHarness(respond) {
  const calls = []
  const module = load('src/shared/stores/products.js', {
    pinia: { defineStore: (_name, setup) => setup },
    vue,
    '@/shared/api/http': { request: async (path, init = {}) => { calls.push({ path, init }); return respond(path, init) } },
    './session': { useSessionStore: () => session },
  })
  return { store: module.useProductsStore(), module, calls }
}

const product = (id, name = id) => ({ id, name, type: 'general', image: null, reviewCount: 0 })

test('products load from the product list API', async () => {
  const h = productsHarness(() => [product('a'), product('b')])
  await h.store.load()
  assert.deepEqual(h.calls.map(c => c.path), ['/products'])
  assert.deepEqual(h.store.list.value.map(p => p.id), ['a', 'b'])
  assert.equal(h.store.loaded.value, true)
})

test('creating sends metadata and the image as multipart and lists the new product first', async () => {
  const h = productsHarness((path) => (path === '/products' && h.calls.length > 1 ? product('new', '세럼') : [product('a')]))
  await h.store.load()
  const image = new Blob(['png'], { type: 'image/png' })
  await h.store.create({ name: '세럼', type: 'functional', image })
  const { init } = h.calls[1]
  assert.equal(init.method, 'POST')
  assert.ok(init.body instanceof FormData)
  assert.deepEqual(JSON.parse(init.body.get('metadata')), { name: '세럼', type: 'functional' })
  assert.ok(init.body.get('image'))
  assert.deepEqual(h.store.list.value.map(p => p.id), ['new', 'a'])
})

test('updating sends only name and type as JSON and replaces the product', async () => {
  const h = productsHarness((path, init) => (init.method === 'PATCH' ? { ...product('a'), name: '바뀐 이름' } : [product('a')]))
  await h.store.load()
  await h.store.update('a', { name: '바뀐 이름', type: 'general' })
  assert.equal(h.calls[1].path, '/products/a')
  assert.deepEqual(JSON.parse(h.calls[1].init.body), { name: '바뀐 이름', type: 'general' })
  assert.equal(h.store.byId('a').name, '바뀐 이름')
})

test('a product with reviews stays listed when the server refuses to delete it', async () => {
  const h = productsHarness((_path, init) => {
    if (init.method === 'DELETE') throw new Error('PRODUCT_HAS_REVIEWS')
    return [product('a')]
  })
  await h.store.load()
  await assert.rejects(h.store.remove('a'), /PRODUCT_HAS_REVIEWS/)
  assert.deepEqual(h.store.list.value.map(p => p.id), ['a'])
  assert.equal(h.module.productErrorKey('PRODUCT_HAS_REVIEWS'), 'products.errors.PRODUCT_HAS_REVIEWS')
  assert.equal(h.module.productErrorKey('SOMETHING_ELSE'), null)
})

test('a deleted product leaves the list', async () => {
  const h = productsHarness((_path, init) => (init.method === 'DELETE' ? { ok: true } : [product('a'), product('b')]))
  await h.store.load()
  await h.store.remove('a')
  assert.equal(h.calls[1].path, '/products/a')
  assert.deepEqual(h.store.list.value.map(p => p.id), ['b'])
})

test('a review submission carries the chosen productId', async () => {
  const calls = []
  const reviews = load('src/shared/stores/reviews.js', {
    pinia: { defineStore: (_name, setup) => setup },
    vue,
    '@/shared/api/http': { request: async (path, init = {}) => { calls.push({ path, init }); return { id: 'r', tenantId: 't', versions: [{ no: 1, status: 'done' }] } } },
    '@/shared/api/reviewEvents': { openReviewStream: () => () => {} },
    './session': { useSessionStore: () => session },
    './credits': { useCreditsStore: () => ({ loadBalance: async () => {} }) },
    '@/shared/i18n': { t: key => key },
  }, { File, setTimeout: () => 0, clearTimeout: () => {} }).useReviewsStore()
  const file = new File(['png'], 'ad.png', { type: 'image/png' })
  await reviews.createReview({ productId: 'p1', product: { name: '세럼', category: 'general' }, media: [], files: [{ file }], evidence: [] })
  const metadata = JSON.parse(calls[0].init.body.get('metadata'))
  assert.equal(metadata.productId, 'p1')
  assert.deepEqual(metadata.product, { name: '세럼', category: 'general' })
})

test('reviews loaded by product survive a reload of the recent list', async () => {
  const calls = []
  const old = { id: 'old', tenantId: 't', productId: 'p1', summary: true, updatedAt: '2026-01-01', versions: [{ no: 1, status: 'done' }] }
  const recent = { id: 'new', tenantId: 't', productId: 'p2', summary: true, updatedAt: '2026-10-22', versions: [{ no: 1, status: 'done' }] }
  const reviews = load('src/shared/stores/reviews.js', {
    pinia: { defineStore: (_name, setup) => setup },
    vue,
    '@/shared/api/http': { request: async (path) => {
      calls.push(path)
      return path.startsWith('/products/') ? [old] : [recent]
    } },
    '@/shared/api/reviewEvents': { openReviewStream: () => () => {} },
    './session': { useSessionStore: () => session },
    './credits': { useCreditsStore: () => ({ loadBalance: async () => {} }) },
    '@/shared/i18n': { t: key => key },
  }, { setTimeout: () => 0, clearTimeout: () => {} }).useReviewsStore()

  await reviews.loadByProduct('p1')
  assert.equal(calls[0], '/products/p1/reviews?view=summary')
  // 전체 목록(최근 200건)에는 오래된 검토가 없다. 다시 받아도 제품 화면에서 받은 검토는 남는다.
  await reviews.load()
  assert.deepEqual([...reviews.list.value.map(r => r.id)].sort(), ['new', 'old'])
})
