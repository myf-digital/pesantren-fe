# Modul keuangan

Mengikuti tampilan dan pola modul `guru-mata-pelajaran` (menu aksi titik tiga, AppFormBuilder/react-hook-form, dan preview impor responsif): setiap modul memiliki `list`, `form`, `import`, dan `slice/index.ts`. Komponen bersama berada di `app/keuangan` agar aturan dan perbaikan konsisten.

| Modul | URL daftar | Resource izin |
| --- | --- | --- |
| Kelompok Kas | `/app/keu-kelompok-kas/list` | `/app/keu-kelompok-kas` |
| Akun | `/app/keu-akun/list` | `/app/keu-akun` |
| Batch Impor | `/app/keu-import-batch/list` | `/app/keu-import-batch` |
| Rekap Harian | `/app/keu-rekap-harian/list` | `/app/keu-rekap-harian` |
| Target | `/app/keu-target/list` | `/app/keu-target` |
| Anggaran | `/app/keu-anggaran/list` | `/app/keu-anggaran` |
| Beasiswa | `/app/keu-beasiswa/list` | `/app/keu-beasiswa` |

Menu sidebar dan izin berasal dari backend, mengikuti mekanisme aplikasi. Daftarkan URL di atas melalui pengelolaan menu dan berikan izin view/create/edit/delete/import/export sesuai role; middleware tetap memeriksa izin setiap route. Tidak ada perubahan otomatis pada database menu/role.

## Penggunaan

1. Buat Kelompok Kas, kemudian Akun. Kelompok kas pada form akun dibatasi ke data aktif.
2. Batch Impor dibuat otomatis oleh backend saat proses import disimpan untuk Rekap Harian, Target, Anggaran, dan Beasiswa. Tidak perlu membuat batch atau mengisi ID Batch pada file import. Form input manual juga tidak menampilkan pilihan Batch Impor dan tidak mengirim ID Batch.
3. Isi tahun ajaran untuk akun periodik pada Rekap Harian dan Target.
4. Nominal dikirim sebagai string desimal untuk menjaga presisi NUMERIC(18,2). Gunakan titik untuk desimal tanpa pemisah ribuan.
5. Koreksi Rekap Harian melalui versi aktif. Backend membuat versi baru; versi histori hanya dapat dilihat. Peringatan selisih saldo ditampilkan setelah penyimpanan tanpa mengganti saldo sumber.
6. Beasiswa PerPenerima mewajibkan santri; Agregat mengosongkan santri. Tahun ajaran dan jenis beasiswa wajib.
7. Unduh template dari halaman impor, isi data, lalu preview. Kesalahan dan peringatan ditampilkan per baris. Import Data mengirim ulang file yang dipreview ke endpoint import dengan mode commit agar backend menyimpan baris valid sekaligus membuat batch otomatis; jika terdapat baris invalid, dialog konfirmasi ditampilkan terlebih dahulu. Mode Commit juga tersedia untuk validasi dan simpan langsung dari file, mengikuti modul referensi. Backend melakukan validasi ulang saat menyimpan.

Backend dan konfigurasi `NEXT_PUBLIC_API_URL` harus tersedia. Frontend memakai instance Axios dan sesi autentikasi aplikasi yang sudah ada.


## Validasi form dan aturan operasional

- Master: kode/nama wajib, teks kosong ditolak, urutan integer, status Aktif/Tidak Aktif. Kelompok kas pada akun wajib aktif. UUID dibuat backend; keunikan kode dan penolakan hapus data yang direferensikan diperiksa backend.
- Rekap: tanggal kalender valid, akun wajib, tahun ajaran wajib untuk akun periodik. Semua saldo/arus wajib numerik; masuk/keluar tidak negatif. Peringatan membandingkan saldo akhir sumber dengan saldo awal + masuk - keluar menggunakan aritmetika sen. Nilai sumber tidak diganti. Backend memeriksa duplikasi tanggal + akun + tahun ajaran dan menyimpan versi koreksi tanpa menghapus histori.
- Target: jenis terbatas Penerimaan/Pengeluaran/Anggaran/Lainnya, periode valid dan berurutan, akun wajib, nilai tidak negatif. Tahun ajaran mengikuti akun periodik. Duplikasi akun + jenis + periode diperiksa backend.
- Anggaran: uraian dan periode wajib; pilihan **Anggaran Per Akun** mewajibkan akun. Nilai disetujui wajib dan tidak negatif, realisasi boleh kosong. Referensi/status sumber opsional. Tidak ada proses persetujuan dalam SADA.
- Beasiswa: tahun ajaran dan jenis wajib, PerPenerima mewajibkan santri, Agregat mengirim santri NULL. Jenis bantuan terbatas Beasiswa/Keringanan/Lainnya. Tanggal valid dan nilai ditetapkan tidak negatif; realisasi opsional tetapi tidak negatif. Referensi master dan duplikasi sesuai granularitas diperiksa backend.
- Sumber impor: batch dan relasi ID Batch ditangani otomatis oleh backend melalui endpoint import dalam mode commit, baik setelah preview maupun pada import langsung. Preview hanya melakukan validasi tanpa membuat batch. Form input manual Rekap Harian, Target, Anggaran, dan Beasiswa tidak meminta atau mengirim ID Batch.

Pengujian validasi frontend: `npm run test:keuangan`. Pengujian ini mencakup payload dan aturan lokal, bukan koneksi database, constraint unik/FK, atau transaksi versi backend.

## Penyesuaian alur dan batas backend

- Input manual mencari master lewat kode dan menampilkan kode beserta nama: `kode_akun`, `kode_kelompok`, `kode_beasiswa`, serta NIS untuk santri. Tahun ajaran menggunakan identitas `tahun_ajaran` dari master utama. UUID tetap dikirim sebagai relasi internal dan tidak dijadikan label pilihan.
- Pencarian referensi memakai parameter `q` pada endpoint master. Backend perlu mendukung pencarian berdasarkan kode/NIS; frontend tidak membuat master dari teks bebas. Master akun/kelompok tidak aktif tidak ditawarkan untuk input baru; relasi pada detail histori tetap ditampilkan.
- Form baru memilih tahun ajaran otomatis hanya jika respons master memuat tepat satu baris dengan `status = Aktif`. Jika tidak ada atau ambigu, pengguna memilih sendiri. Data edit tidak diganti otomatis.
- Anggaran Final merupakan hasil persetujuan di luar SADA. Nilai Referensi Sumber pada beasiswa tetap dikirim melalui kolom `nilai_diajukan`, tanpa workflow pengajuan.
- Impor memakai template resmi backend dan kode bisnis. Lookup kode ke UUID, penolakan kode tidak dikenal, keunikan kode, larangan hapus master terpakai, hash/deduplikasi file, granularitas unik dengan NULL, serta penggantian versi secara atomik wajib ditegakkan oleh backend. Implementasi ini tidak memverifikasi constraint atau transaksi database tersebut.
- Dashboard harus menyatakan cakupan/periode histori yang tersedia dan tidak membuat hari atau nilai nol untuk data parsial. Repositori frontend ini belum membuktikan penerapan aturan tersebut pada sumber laporan backend.

## Kontrak operasional backend

Rujukan: `pesantren-be/docs/keuangan-operasional.md`.

- Batch baru hanya menerima RekapHarian, Target, Anggaran, dan Beasiswa. SaldoAwal hanya kompatibilitas histori backend.
- Form baru memakai `/form-options` dan `id_tahunajaran_default` dari backend; tidak menebak tahun ajaran dari akun.
- Impor keempat jenis data mengirim `aksi=tambah` atau `aksi=koreksi` pada preview dan commit. Koreksi mencocokkan identitas bisnis; anggaran memerlukan kode referensi sumber untuk koreksi tanpa UUID.
- Detail histori keempat jenis data hanya dapat dilihat; aksi edit/hapus disembunyikan. PUT membuat versi baru, DELETE menonaktifkan current. Kode master dikunci pada form edit sesuai aturan kode stabil.
- Backend mendokumentasikan hash file/payload, unique index, trigger master dan transaksi histori. Jaminan ini bergantung pada migration backend yang sudah dijalankan; tes frontend tidak memverifikasi database tujuan.
- Batch manual dibuat backend sebagai InputManual. Publikasi impor otomatis untuk baris valid; tidak ada persetujuan atau publikasi manual tambahan.

## Pola kode

Slice setiap modul mengikuti `kelas-formal`: action bernama `fetchKeu...All`, `fetchKeu...Page`, `fetchKeu...ById`, `postKeu...`, `postKeu...Update`, `deleteKeu...`, `postBatchKeu...`, `postImport`, `postExport`, dan `resetRedux`. State dipisahkan menjadi `dataPage`, `data`, `datas`, `crud`, `delete`, `import`, dan `export`.

Halaman `form`, `list`, dan `import` memasangkan action dari slice modul masing-masing ke komponen bersama. Form tetap menggunakan AppFormBuilder/react-hook-form dan konfigurasi field keuangan. Error API menggunakan rejected action agar pesan gagal tidak dianggap berhasil; pembatalan request saat unmount tetap didukung. Ekspor dan template juga melalui action `postExport`.
