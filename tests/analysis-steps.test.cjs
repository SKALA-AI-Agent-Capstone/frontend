// 진행 단계 표시: Agent가 보내는 steps 자리(0~4)와 화면 단계(사진 검토 없음)의 연결
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

const code = ts.transpileModule(fs.readFileSync('src/shared/api/analysisApi.js', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const context = { exports: {}, require: (name) => {
  assert.equal(name, '@/shared/i18n')
  return { translated: (base, keys) => ({ ...base, ...keys }) }
} }
vm.runInNewContext(code, context)
const api = context.exports
const states = (steps, phase = 'running', options) => [...api.stepStates({ steps }, phase, options)].map((s) => `${s.id}:${s.state}`)

test('the photo step is not shown', () => {
  assert.deepEqual([...api.ANALYSIS_STEPS].map((s) => s.id), ['prepare', 'text', 'business', 'approval'])
})

test('the current agent never sends slot 2 and the steps still advance in order', () => {
  assert.deepEqual(states([100, 100, 0, 0, 0]), ['prepare:done', 'text:done', 'business:running', 'approval:pending'])
  assert.deepEqual(states([100, 100, 0, 100, 0]), ['prepare:done', 'text:done', 'business:done', 'approval:running'])
  assert.equal(api.stepsDone({ steps: [100, 100, 0, 100, 0] }), 3)
})

test('an older agent finishing the photo slot first does not jump ahead', () => {
  // 예전 Agent는 사진 검토를 문구 검토와 동시에 돌려 2번 자리를 먼저 끝냈다
  assert.deepEqual(states([100, 0, 100, 0, 0]), ['prepare:done', 'text:running', 'business:pending', 'approval:pending'])
  assert.equal(api.stepsDone({ steps: [100, 0, 100, 0, 0] }), 1)
  assert.equal(api.currentStepIndex({ steps: [100, 0, 100, 0, 0] }), 1)
})

test('done and failed phases and the not yet accepted state', () => {
  assert.deepEqual(states([100, 0, 0, 0, 0], 'done'), ['prepare:done', 'text:done', 'business:done', 'approval:done'])
  assert.deepEqual(states([100, 100, 0, 0, 0], 'failed'), ['prepare:done', 'text:done', 'business:failed', 'approval:pending'])
  assert.deepEqual(states([0, 0, 0, 0, 0], 'preparing', { active: false }), ['prepare:pending', 'text:pending', 'business:pending', 'approval:pending'])
  assert.equal(api.currentStepIndex({ steps: [100, 100, 100, 100, 100] }), 3)
})
