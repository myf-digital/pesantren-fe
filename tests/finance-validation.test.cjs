/* eslint-disable @typescript-eslint/no-var-requires -- CommonJS entry point for the Node test runner. */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')

const ts = require('typescript')

function loadTypeScript(relativePath) {
  const filename = path.resolve(__dirname, '..', relativePath)

  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  })

  const loaded = new Module(filename, module)

  loaded.filename = filename
  loaded.paths = module.paths
  loaded._compile(compiled.outputText, filename)

  return loaded.exports
}

const base = 'src/app/(dashboard)/(private)/app/keuangan/'
const { modules } = loadTypeScript(base + 'config.ts')
const { budgetRemaining, buildFinancePayload, dailyBalanceWarnings } = loadTypeScript(base + 'validation.ts')

function fixture(resource) {
  return Object.fromEntries(
    modules[resource].fields.map(field => [
      field.key,
      field.dataType === 'boolean'
        ? (field.defaultValue ?? true)
        : field.dataType === 'integer'
          ? field.key === 'nomor_baris_sumber'
            ? '1'
            : '0'
          : field.dataType === 'money'
            ? resource === 'keu-anggaran' && ['nilai_disetujui', 'nilai_realisasi'].includes(field.key)
              ? ''
              : '100.00'
            : field.dataType === 'date'
              ? '2026-10-27'
              : field.dataType === 'select'
                ? { value: field.options[0] }
                : field.dataType === 'reference'
                  ? { value: field.key, is_active: true }
                  : 'Contoh'
    ])
  )
}

const validate = (resource, values, account) =>
  buildFinancePayload(resource, modules[resource], { ...fixture(resource), ...values }, account)

test('all seven configurations produce valid payloads without generated UUID fields', () => {
  for (const resource of Object.keys(modules)) {
    const result = validate(resource)

    assert.deepEqual(result.errors, {}, resource)
    assert.equal(Object.hasOwn(result.payload, modules[resource].id), false)
  }
})
test('master: whitespace, integer, strict boolean, and inactive group', () => {
  assert.ok(validate('keu-kelompok-kas', { kode_kelompok: '  ' }).errors.kode_kelompok)
  assert.ok(validate('keu-kelompok-kas', { urutan: '1.5' }).errors.urutan)
  assert.ok(validate('keu-akun', { is_active: 'false' }).errors.is_active)
  assert.ok(validate('keu-akun', { id_kelompok_kas: { value: 'kas', is_active: false } }).errors.id_kelompok_kas)
  assert.equal(validate('keu-kelompok-kas', { urutan: '0', is_active: false }).payload.is_active, false)
})
test('daily: required zero, decimal precision, negatives, date validity and periodic year', () => {
  assert.equal(validate('keu-rekap-harian', { masuk: '' }).errors.masuk, 'Masuk wajib diisi')
  assert.deepEqual(validate('keu-rekap-harian', { masuk: '0', saldo_awal: '-1.00' }).errors, {})
  assert.ok(validate('keu-rekap-harian', { masuk: '-0.01' }).errors.masuk)
  assert.ok(validate('keu-rekap-harian', { keluar: '-1.00' }).errors.keluar)
  assert.ok(validate('keu-rekap-harian', { tanggal: '2026-02-30' }).errors.tanggal)
  assert.ok(validate('keu-rekap-harian', { tanggal: new Date('invalid') }).errors.tanggal)
  assert.ok(
    validate('keu-rekap-harian', { id_tahunajaran: null }, { is_periodik_tahun_ajaran: true }).errors.id_tahunajaran
  )
  assert.deepEqual(
    validate('keu-rekap-harian', { id_tahunajaran: null }, { is_periodik_tahun_ajaran: false }).errors,
    {}
  )
  assert.equal(
    validate('keu-rekap-harian', { saldo_awal: '9999999999999999.99' }).payload.saldo_awal,
    '9999999999999999.99'
  )
  assert.ok(validate('keu-rekap-harian', { masuk: '1.001' }).errors.masuk)
})
test('balance warning uses cents without floating point loss or changing source', () => {
  assert.deepEqual(
    dailyBalanceWarnings({
      saldo_awal: '9999999999999999.89',
      masuk: '0.10',
      keluar: '0',
      saldo_akhir: '9999999999999999.99'
    }),
    []
  )
  const values = { saldo_awal: '100', masuk: '20', keluar: '10', saldo_akhir: '111' }

  assert.match(dailyBalanceWarnings(values)[0], /110,00; selisih 1,00/)
  assert.equal(values.saldo_akhir, '111')
  assert.equal(
    dailyBalanceWarnings({
      saldo_awal: '9999999999999999.89',
      masuk: '0.10',
      keluar: '0',
      saldo_akhir: '9999999999999998.99'
    })[0],
    'Saldo akhir sumber 9.999.999.999.999.998,99 berbeda dari perhitungan 9.999.999.999.999.999,99; selisih -1,00. Saldo sumber tetap disimpan.'
  )
  assert.deepEqual(dailyBalanceWarnings({}), [])
})
test('target and budget periods, enums, negative amounts and per-account requirement', () => {
  assert.ok(validate('keu-target', { periode_selesai: '2026-01-01' }).errors.periode_selesai)
  assert.ok(validate('keu-target', { jenis_target: { value: 'Invalid' } }).errors.jenis_target)
  assert.ok(validate('keu-target', { nilai_target: '-1' }).errors.nilai_target)
  assert.ok(validate('keu-anggaran', { per_akun: true, id_akun: null }).errors.id_akun)
  assert.deepEqual(validate('keu-anggaran', { per_akun: false, id_akun: null, nilai_realisasi: '' }).errors, {})
  assert.ok(validate('keu-anggaran', { nilai_disetujui: '-1' }).errors.nilai_disetujui)
})
test('scholarship scope, references, allowed aid types and optional realization', () => {
  assert.ok(validate('keu-beasiswa', { id_santri: null }).errors.id_santri)
  const result = validate('keu-beasiswa', { cakupan_data: { value: 'Agregat' }, id_santri: null, nilai_realisasi: '' })

  assert.deepEqual(result.errors, {})
  assert.equal(result.payload.id_santri, null)
  assert.equal(result.payload.nilai_realisasi, null)
  assert.ok(validate('keu-beasiswa', { id_tahunajaran: null }).errors.id_tahunajaran)
  assert.ok(validate('keu-beasiswa', { id_jenis_beasiswa: null }).errors.id_jenis_beasiswa)
  assert.ok(validate('keu-beasiswa', { jenis_bantuan: { value: 'TidakValid' } }).errors.jenis_bantuan)
  assert.ok(validate('keu-beasiswa', { nilai_realisasi: '-1' }).errors.nilai_realisasi)
})

test('reference choices show business codes and names while payloads retain internal IDs', () => {
  const { referenceOption } = loadTypeScript(base + 'references.ts')
  const accountField = modules['keu-rekap-harian'].fields.find(field => field.key === 'id_akun')

  const option = referenceOption(accountField, {
    id_akun: 'internal-id',
    kode_akun: 'KAS01',
    nama_akun: 'Kas Umum',
    is_active: true
  })

  assert.equal(option.label, 'KAS01 — Kas Umum')
  assert.equal(option.value, 'internal-id')
  assert.equal(validate('keu-rekap-harian', { id_akun: option }).payload.id_akun, 'internal-id')
  assert.ok(validate('keu-rekap-harian', { id_akun: { ...option, is_active: false } }).errors.id_akun)
  assert.equal(referenceOption(accountField, { id_akun: 'hidden-uuid' }).label.includes('hidden-uuid'), false)
})

test('budget requires positive amounts according to source status and preserves decimal precision', () => {
  const budget = (status, approved, realized, proposed = '5000000') =>
    validate('keu-anggaran', {
      status_sumber: { value: status },
      nilai_diajukan: proposed,
      nilai_disetujui: approved,
      nilai_realisasi: realized
    })

  assert.deepEqual(budget('Diajukan', '', '0').errors, {})
  assert.deepEqual(budget('Ditolak', null, null).errors, {})
  assert.ok(budget('Diajukan', '1', '0').errors.nilai_disetujui)
  assert.ok(budget('Ditolak', '0', '1').errors.nilai_realisasi)
  assert.ok(budget('Diajukan', '', '', '0').errors.nilai_diajukan)
  assert.ok(budget('Diajukan', '', '', 'invalid').errors.nilai_diajukan)
  assert.ok(budget('Final', '', '').errors.status_sumber)
  assert.ok(budget('Disetujui', '', '').errors.nilai_disetujui)
  assert.ok(budget('Disetujui', '4150000', '1').errors.nilai_realisasi)
  assert.ok(budget('Realisasi', '4150000', '').errors.nilai_realisasi)
  assert.ok(budget('Realisasi', '4150000', '4150000.01').errors.nilai_realisasi)
  assert.ok(budget('Disetujui', '9999999999999999.99', '', '9999999999999999.98').errors.nilai_disetujui)

  const valid = budget('Realisasi', '4150000', '2000000')

  assert.deepEqual(valid.errors, {})
  assert.equal(valid.payload.nilai_diajukan, '5000000')
  assert.equal(budgetRemaining(valid.payload), '2.150.000,00')
  assert.equal(budgetRemaining(budget('Disetujui', '4150000', '').payload), '4.150.000,00')
  assert.equal(budgetRemaining(budget('Diajukan', '', '').payload), null)
})
