export type Field = {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'date' | 'integer' | 'numeral' | 'checkbox' | 'select'
  dataType?: 'text' | 'textarea' | 'date' | 'integer' | 'money' | 'boolean' | 'select' | 'reference'
  required?: boolean
  options?: string[]
  source?: string
  idKey?: string
  codeKey?: string
  labelKey?: string
  params?: Record<string, string | boolean>
  defaultValue?: string | number | boolean
  maxLength?: number
  signed?: boolean
}
export type ModuleConfig = {
  title: string
  id: string
  fields: Field[]
  columns: [string, string][]
  batchType?: string
  master?: boolean
}

const f = (
  key: string,
  label: string,
  dataType: Field['dataType'] = 'text',
  required = false,
  extra: Partial<Field> = {}
): Field => ({
  key,
  label,
  type:
    key === 'is_active' || dataType === 'reference' || dataType === 'select'
      ? 'select'
      : dataType === 'boolean'
        ? 'checkbox'
        : dataType === 'integer'
          ? 'integer'
          : dataType === 'money'
            ? 'numeral'
            : dataType,
  dataType,
  required,
  ...extra
})

const referenceCodeKeys: Record<string, string> = {
  'keu-akun': 'kode_akun',
  'keu-kelompok-kas': 'kode_kelompok',
  'jenis-beasiswa': 'kode_beasiswa',
  'tahun-ajaran': 'tahun_ajaran',
  santri: 'nis'
}

const ref = (
  key: string,
  label: string,
  source: string,
  idKey: string,
  labelKey: string,
  required = true,
  params = {}
): Field =>
  f(key, label, 'reference', required, {
    source,
    idKey,
    labelKey,
    codeKey: referenceCodeKeys[source],
    params
  })

const akun = ref('id_akun', 'Akun', 'keu-akun', 'id_akun', 'nama_akun')
const tahun = ref('id_tahunajaran', 'Tahun Ajaran', 'tahun-ajaran', 'id_tahunajaran', 'tahun_ajaran', false)

const ket = f('keterangan', 'Keterangan', 'textarea')

const masterFields = [
  f('urutan', 'Urutan', 'integer', true, { defaultValue: 0 }),
  f('is_active', 'Status', 'boolean', false, { defaultValue: true }),
  ket
]

const periode = [
  f('periode_mulai', 'Periode Mulai', 'date', true),
  f('periode_selesai', 'Periode Selesai', 'date', true)
]

const current = f('is_current', 'Data Aktif', 'boolean', false, { defaultValue: true })

export const modules: Record<string, ModuleConfig> = {
  'keu-kelompok-kas': {
    title: 'Kelompok Kas',
    id: 'id_kelompok_kas',
    master: true,
    fields: [
      f('kode_kelompok', 'Kode Kelompok', 'text', true, { maxLength: 50 }),
      f('nama_kelompok', 'Nama Kelompok', 'text', true, { maxLength: 150 }),
      ...masterFields
    ],
    columns: [
      ['kode_kelompok', 'Kode'],
      ['nama_kelompok', 'Nama Kelompok'],
      ['urutan', 'Urutan'],
      ['is_active', 'Aktif']
    ]
  },
  'keu-akun': {
    title: 'Akun Keuangan',
    id: 'id_akun',
    master: true,
    fields: [
      f('kode_akun', 'Kode Akun', 'text', true, { maxLength: 50 }),
      f('nama_akun', 'Nama Akun', 'text', true, { maxLength: 200 }),
      ref('id_kelompok_kas', 'Kelompok Kas', 'keu-kelompok-kas', 'id_kelompok_kas', 'nama_kelompok', true, {
        is_active: true
      }),
      f('is_periodik_tahun_ajaran', 'Periodik Tahun Ajaran', 'boolean', false, { defaultValue: false }),
      ...masterFields
    ],
    columns: [
      ['kode_akun', 'Kode'],
      ['nama_akun', 'Nama Akun'],
      ['kelompok_kas.nama_kelompok', 'Kelompok Kas'],
      ['is_periodik_tahun_ajaran', 'Periodik'],
      ['is_active', 'Aktif']
    ]
  },
  'keu-import-batch': {
    title: 'Batch Impor Keuangan',
    id: 'id_batch',
    fields: [
      f('jenis_data', 'Jenis Data', 'select', true, {
        options: ['RekapHarian', 'Target', 'Anggaran', 'Beasiswa']
      }),
      f('nama_file', 'Nama File', 'text', false, { maxLength: 255 }),
      f('hash_file', 'Hash File', 'text', false, { maxLength: 128 }),
      f('periode_awal', 'Periode Awal', 'date'),
      f('periode_akhir', 'Periode Akhir', 'date'),
      f('sumber_data', 'Sumber Data', 'text', false, { maxLength: 200 }),
      f('status_batch', 'Status Batch', 'select', true, {
        options: ['Draft', 'ValidasiGagal', 'SiapPublikasi', 'Dipublikasikan', 'Digantikan', 'Dibatalkan'],
        defaultValue: 'Draft'
      }),
      ...['jumlah_baris', 'jumlah_valid', 'jumlah_error'].map(key =>
        f(
          key,
          key.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase()),
          'integer',
          true,
          { defaultValue: 0 }
        )
      ),
      ref('menggantikan_batch_id', 'Menggantikan Batch', 'keu-import-batch', 'id_batch', 'nama_file', false),
      f('catatan', 'Catatan', 'textarea')
    ],
    columns: [
      ['id_batch', 'ID Batch'],
      ['nama_file', 'Nama File'],
      ['jenis_data', 'Jenis Data'],
      ['sumber_data', 'Sumber'],
      ['status_batch', 'Status'],
      ['jumlah_baris', 'Baris'],
      ['jumlah_valid', 'Valid'],
      ['jumlah_error', 'Error']
    ]
  },
  'keu-rekap-harian': {
    title: 'Rekap Harian Keuangan',
    id: 'id_rekap',
    batchType: 'RekapHarian',
    fields: [
      f('tanggal', 'Tanggal', 'date', true),
      akun,
      tahun,
      ...['saldo_awal', 'masuk', 'keluar', 'saldo_akhir'].map(key =>
        f(
          key,
          key.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase()),
          'money',
          true,
          { signed: key.startsWith('saldo') }
        )
      ),
      f('nomor_baris_sumber', 'Nomor Baris Sumber', 'integer'),
      ket
    ],
    columns: [
      ['tanggal', 'Tanggal'],
      ['akun.nama_akun', 'Akun'],
      ['tahun_ajaran.tahun_ajaran', 'Tahun Ajaran'],
      ['saldo_awal', 'Saldo Awal'],
      ['masuk', 'Masuk'],
      ['keluar', 'Keluar'],
      ['saldo_akhir', 'Saldo Akhir'],
      ['is_current', 'Aktif']
    ]
  },
  'keu-target': {
    title: 'Target Keuangan',
    id: 'id_target',
    batchType: 'Target',
    fields: [
      f('nama_target', 'Nama Target', 'text', true, { maxLength: 200 }),
      f('jenis_target', 'Jenis Target', 'select', true, {
        options: ['Penerimaan', 'Pengeluaran', 'Anggaran', 'Lainnya']
      }),
      ...periode,
      akun,
      tahun,
      f('nilai_target', 'Nilai Target', 'money', true),
      current,
      ket
    ],
    columns: [
      ['nama_target', 'Nama Target'],
      ['jenis_target', 'Jenis'],
      ['akun.nama_akun', 'Akun'],
      ['periode_mulai', 'Mulai'],
      ['periode_selesai', 'Selesai'],
      ['nilai_target', 'Nilai Target'],
      ['is_current', 'Aktif']
    ]
  },
  'keu-anggaran': {
    title: 'Anggaran Final',
    id: 'id_anggaran',
    batchType: 'Anggaran',
    fields: [
      f('nama_anggaran', 'Nama Anggaran', 'text', true, { maxLength: 200 }),
      ...periode,
      f('per_akun', 'Anggaran Per Akun', 'boolean', false, { defaultValue: false }),
      { ...akun, required: false },
      f('kode_referensi_sumber', 'Kode Referensi Sumber', 'text', false, { maxLength: 150 }),
      f('status_sumber', 'Status Sumber', 'text', false, { maxLength: 100 }),
      f('nilai_disetujui', 'Nilai Disetujui', 'money', true),
      f('nilai_realisasi', 'Nilai Realisasi', 'money'),
      current,
      ket
    ],
    columns: [
      ['nama_anggaran', 'Nama Anggaran'],
      ['akun.nama_akun', 'Akun'],
      ['periode_mulai', 'Mulai'],
      ['periode_selesai', 'Selesai'],
      ['nilai_disetujui', 'Disetujui'],
      ['nilai_realisasi', 'Realisasi'],
      ['status_sumber', 'Status Sumber'],
      ['is_current', 'Aktif']
    ]
  },
  'keu-beasiswa': {
    title: 'Beasiswa Keuangan',
    id: 'id_rekap_beasiswa',
    batchType: 'Beasiswa',
    fields: [
      f('cakupan_data', 'Cakupan Data', 'select', true, {
        options: ['PerPenerima', 'Agregat'],
        defaultValue: 'PerPenerima'
      }),
      { ...tahun, required: true },
      ref('id_santri', 'Santri', 'santri', 'id_santri', 'fullname', false),
      ref('id_jenis_beasiswa', 'Jenis Beasiswa', 'jenis-beasiswa', 'id_beasiswa', 'nama_beasiswa'),
      f('jenis_bantuan', 'Jenis Bantuan', 'select', true, { options: ['Beasiswa', 'Keringanan', 'Lainnya'] }),
      f('nama_program', 'Nama Program', 'text', false, { maxLength: 200 }),
      f('status_final', 'Status Final', 'text', true, { maxLength: 30 }),
      f('tanggal_data', 'Tanggal Data', 'date', true),
      f('nilai_diajukan', 'Nilai Referensi Sumber', 'money', false, { signed: true }),
      f('nilai_ditetapkan', 'Nilai Ditetapkan', 'money', true),
      f('nilai_realisasi', 'Nilai Realisasi', 'money'),
      current,
      ket
    ],
    columns: [
      ['tanggal_data', 'Tanggal'],
      ['cakupan_data', 'Cakupan'],
      ['santri.fullname', 'Santri'],
      ['jenis_beasiswa.nama_beasiswa', 'Jenis Beasiswa'],
      ['tahun_ajaran.tahun_ajaran', 'Tahun Ajaran'],
      ['nilai_ditetapkan', 'Ditetapkan'],
      ['nilai_realisasi', 'Realisasi'],
      ['status_final', 'Status'],
      ['is_current', 'Aktif']
    ]
  }
}
