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
2. Buat Batch Impor dengan jenis data yang sesuai sebelum mengisi rekap, anggaran, atau beasiswa. ID Batch tersedia pada daftar batch untuk disalin ke template Excel. Batch dibatalkan tidak tersedia pada pilihan form.
3. Isi tahun ajaran untuk akun periodik pada Rekap Harian dan Target.
4. Nominal dikirim sebagai string desimal untuk menjaga presisi NUMERIC(18,2). Gunakan titik untuk desimal tanpa pemisah ribuan.
5. Koreksi Rekap Harian melalui versi aktif. Backend membuat versi baru; versi histori hanya dapat dilihat. Peringatan selisih saldo ditampilkan setelah penyimpanan tanpa mengganti saldo sumber.
6. Beasiswa PerPenerima mewajibkan santri; Agregat mengosongkan santri. Tahun ajaran dan jenis beasiswa wajib.
7. Unduh template dari halaman impor, isi data, lalu preview. Kesalahan dan peringatan ditampilkan per baris. Import Data menyimpan baris valid melalui endpoint insert; jika terdapat baris invalid, dialog konfirmasi ditampilkan terlebih dahulu. Mode Commit juga tersedia untuk validasi dan simpan langsung dari file, mengikuti modul referensi. Backend melakukan validasi ulang saat menyimpan.

Backend dan konfigurasi `NEXT_PUBLIC_API_URL` harus tersedia. Frontend memakai instance Axios dan sesi autentikasi aplikasi yang sudah ada.


## Validasi form dan aturan operasional

- Master: kode/nama wajib, teks kosong ditolak, urutan integer, status Aktif/Tidak Aktif. Kelompok kas pada akun wajib aktif. UUID dibuat backend; keunikan kode dan penolakan hapus data yang direferensikan diperiksa backend.
- Rekap: tanggal kalender valid, akun wajib, tahun ajaran wajib untuk akun periodik. Semua saldo/arus wajib numerik; masuk/keluar tidak negatif. Peringatan membandingkan saldo akhir sumber dengan saldo awal + masuk - keluar menggunakan aritmetika sen. Nilai sumber tidak diganti. Backend memeriksa duplikasi tanggal + akun + tahun ajaran dan menyimpan versi koreksi tanpa menghapus histori.
- Target: jenis terbatas Penerimaan/Pengeluaran/Anggaran/Lainnya, periode valid dan berurutan, akun wajib, nilai tidak negatif. Tahun ajaran mengikuti akun periodik. Duplikasi akun + jenis + periode diperiksa backend.
- Anggaran: uraian dan periode wajib; pilihan **Anggaran Per Akun** mewajibkan akun. Nilai disetujui wajib dan tidak negatif, realisasi boleh kosong. Referensi/status sumber opsional. Tidak ada proses persetujuan dalam SADA.
- Beasiswa: tahun ajaran dan jenis wajib, PerPenerima mewajibkan santri, Agregat mengirim santri NULL. Jenis bantuan terbatas Beasiswa/Keringanan/Lainnya. Tanggal valid dan nilai ditetapkan tidak negatif; realisasi opsional tetapi tidak negatif. Referensi master dan duplikasi sesuai granularitas diperiksa backend.
- Sumber impor: gunakan batch dengan jenis sesuai dan status selain Dibatalkan. Kontrak backend saat ini juga mewajibkan batch untuk input manual rekap, anggaran, dan beasiswa; frontend mempertahankan kewajiban ini. Pembedaan wajib batch hanya untuk impor memerlukan perubahan kontrak backend.

Pengujian validasi frontend: `npm run test:keuangan`. Pengujian ini mencakup payload dan aturan lokal, bukan koneksi database, constraint unik/FK, atau transaksi versi backend.
