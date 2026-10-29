/* eslint-disable @typescript-eslint/no-var-requires -- CommonJS entry point for the Node test runner. */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')

const ts = require('typescript')
const { configureStore } = require('@reduxjs/toolkit')

const resources = [
  'keu-kelompok-kas',
  'keu-akun',
  'keu-import-batch',
  'keu-rekap-harian',
  'keu-target',
  'keu-anggaran',
  'keu-beasiswa'
]

function loadSlice(resource, api) {
  const filename = path.resolve(__dirname, '../src/app/(dashboard)/(private)/app', resource, 'slice/index.ts')

  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  })

  const loaded = new Module(filename, module)

  loaded.filename = filename
  loaded.paths = module.paths
  loaded.require = name => (name === '@/libs/axios' ? { default: api } : require(name))
  loaded._compile(compiled.outputText, filename)

  return loaded.exports
}

test('finance slices route each operation and maintain separate state like kelas-formal', async () => {
  for (const resource of resources) {
    const calls = []
    const result = { status: true, data: { values: [{ id: 'row' }], total: 1 }, message: 'Saved' }

    const api = Object.fromEntries(
      ['get', 'post', 'put', 'delete'].map(method => [
        method,
        async (...args) => {
          calls.push({ method, args })

          return { data: result }
        }
      ])
    )

    const slice = loadSlice(resource, api)

    const name = resource
      .split('-')
      .map(word => word[0].toUpperCase() + word.slice(1))
      .join('')

    const store = configureStore({ reducer: slice.default })
    const payload = { kode_akun: 'KAS', nilai_target: '100.00' }

    const operations = [
      [`fetch${name}Page`, { page: 1 }, 'get', `/app/${resource}`, 'dataPage'],
      [`fetch${name}ById`, 'row', 'get', `/app/${resource}/row`, 'data'],
      [`post${name}`, payload, 'post', `/app/${resource}`, 'crud'],
      [`post${name}Update`, { id: 'row', params: payload }, 'put', `/app/${resource}/row`, 'crud'],
      [`delete${name}`, 'row', 'delete', `/app/${resource}/row`, 'delete'],
      ['postImport', new FormData(), 'post', `/app/${resource}/import`, 'import'],
      ['postExport', { template: 1 }, 'post', `/app/${resource}/export`, 'export']
    ]

    for (const [action, input, method, url, stateKey] of operations) {
      await store.dispatch(slice[action](input)).unwrap()
      const call = calls.at(-1)

      assert.equal(call.method, method)
      assert.equal(call.args[0], url)
      if (action === `post${name}Update`) assert.deepEqual(call.args[1], payload)
      assert.ok(store.getState()[stateKey])
    }

    store.dispatch(slice.resetRedux())
    assert.deepEqual(store.getState().dataPage, { values: [], total: 0 })
    assert.equal(store.getState().crud, null)
    assert.equal(store.getState().import, null)
    assert.equal(store.getState().export, null)
  }
})

test('failed finance writes reject without setting success state', async () => {
  const slice = loadSlice('keu-target', {
    post: async () => ({ data: { status: false, message: 'Kode tidak dikenal' } })
  })

  const store = configureStore({ reducer: slice.default })

  await assert.rejects(
    async () => store.dispatch(slice.postKeuTarget({})).unwrap(),
    error => error === 'Kode tidak dikenal'
  )
  assert.equal(store.getState().crud, null)
})
