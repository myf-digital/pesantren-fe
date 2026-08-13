// path: src/store/dummy.data.ts

export const DUMMY_KAMAR = {
  shift_terpilih: "SHF-01",
  rekap_kamar: [
    {
      id_lokasi_kamar: "LOC-001",
      nama_kamar: "Kamar Abu Bakar",
      total_santri: 15,
      shifts_valid: [
        {
          id_shift: "SHF-01",
          nama_shift: "Subuh",
          total_santri_belum_absen: 2,
          santri_belum_absen: [
            { id_santri: "S-01", nama_santri: "Ahmad", id_waliasuh: "PEG-123", no_hp: "082324282068", nama_waliasuh: "Ust. Fulan" },
            { id_santri: "S-02", nama_santri: "Budi", id_waliasuh: "PEG-456", no_hp: "082324282068", nama_waliasuh: "Ust. Haris" }
          ]
        }
      ],
      shifts_unmapped: []
    },
    {
      id_lokasi_kamar: "LOC-002",
      nama_kamar: "Kamar Umar",
      total_santri: 10,
      shifts_valid: [],
      shifts_unmapped: [
        {
          id_shift: "SHF-01",
          nama_shift: "Subuh",
          total_santri_belum_absen: 1,
          santri_belum_absen: [
            { id_santri: "S-10", nama_santri: "Zidan", id_waliasuh: "PEG-123", no_hp: "082324282068", nama_waliasuh: "Ust. Fulan" }
          ]
        }
      ]
    }
  ],
  rekap_waliasuh: [
    {
      id_waliasuh: "PEG-123",
      nama_waliasuh: "Ust. Fulan",
      no_hp: "082324282068",
      total_santri_belum_absen: 3,
      kamar_tanggung_jawab: [
        { id_lokasi_kamar: "LOC-001", nama_kamar: "Kamar Abu Bakar", id_shift: "SHF-01", nama_shift: "Subuh", total_santri: 15 },
        { id_lokasi_kamar: "LOC-002", nama_kamar: "Kamar Umar (Shift Tak Wajar)", id_shift: "SHF-01", nama_shift: "Subuh", total_santri: 10 }
      ]
    },
    {
      id_waliasuh: "PEG-456",
      nama_waliasuh: "Ust. Haris",
      no_hp: "082324282068",
      total_santri_belum_absen: 1,
      kamar_tanggung_jawab: [
        { id_lokasi_kamar: "LOC-001", nama_kamar: "Kamar Abu Bakar", id_shift: "SHF-01", nama_shift: "Subuh", total_santri: 15 }
      ]
    }
  ]
};

export const DUMMY_KELAS = {
  jam_pelajaran_terpilih: ["JP-F03", "JP-M01"],
  rekap_kelas: [
    {
      id_kelas: "KLS-F-10",
      nama_kelas: "X IPA 1",
      tipe_kelas: "FORMAL",
      total_santri: 30,
      jam_pelajaran_valid: [
        {
          id_jam_pelajaran: "JP-F03",
          nama_jampel: "Jam ke-3 (09:00 - 10:30)",
          total_santri_belum_absen: 2,
          santri_belum_absen: [
            { id_santri: "S-001", nama_santri: "Ahmad Dahlan", nis: "100101" },
            { id_santri: "S-002", nama_santri: "Budi Santoso", nis: "100102" }
          ]
        }
      ],
      jam_pelajaran_unmapped: []
    }
  ]
};

export const DUMMY_PEGAWAI = [
  {
    id_lokasi: "LOK-001",
    nama_lokasi: "Kantor Pusat",
    total_pegawai_lokasi: 45,
    total_pegawai_belum_absen: 2,
    pegawai_belum_absen: [
      { id_pegawai: "PEG-101", nama_pegawai: "Budi Santoso", nip: "19800101", no_hp: "082324282068", id_jamkerja: "JKP-1234", waktu_mulai: "07:30:00", waktu_selesai: "16:00:00", status_presensi: "Belum Absen" },
      { id_pegawai: "PEG-105", nama_pegawai: "Siti Aminah", nip: "19850202", no_hp: "082324282068", id_jamkerja: "JKP-5678", waktu_mulai: "08:00:00", waktu_selesai: "16:30:00", status_presensi: "Belum Absen" }
    ]
  }
];

export const DUMMY_GURU = [
  {
    id_pegawai: "PEG-001",
    nama_guru: "Ust. Fulan bin Fulan",
    nip: "19801010",
    no_hp: "082324282068",
    total_jadwal_terlewat: 2,
    jadwal_terlewat: [
      { id_jadwal: "JAD-001", id_kelas: "KLS-F-10", nama_kelas: "X IPA 1", id_jam_pelajaran: "JP-01", nama_jampel: "Jam ke-1", waktu_mulai: "07:00:00", waktu_selesai: "08:30:00", status_presensi: "Belum Mengisi Jurnal" },
      { id_jadwal: "JAD-005", id_kelas: "KLS-M-02", nama_kelas: "Wustho A", id_jam_pelajaran: "JP-11", nama_jampel: "Sesi Siang", waktu_mulai: "13:30:00", waktu_selesai: "15:00:00", status_presensi: "Belum Mengisi Jurnal" }
    ]
  }
];

export const DUMMY_INSPEKSI = [
  {
    id_petugas: "PEG-501",
    nama_petugas: "Joko Susilo",
    nip: "19920101",
    no_hp: "082324282068",
    total_tugas_terlewat: 2,
    jadwal_terlewat: [
      { id_jadwal: "JAD-K-01", id_cabang: "CAB-01", nama_cabang: "Kampus Utama", kode_slot: "SLOT-PAGI", jam_mulai: "06:00:00", jam_selesai: "07:30:00", keterangan_slot: "Inspeksi Pagi Hari", status_inspeksi: "Belum Inspeksi" }
    ]
  }
];
