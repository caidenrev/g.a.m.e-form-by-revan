# Fitur Validasi Member GSA

## Overview
Sistem validasi member yang ketat untuk memastikan hanya member GSA yang terdaftar resmi yang bisa mendaftar dengan data yang akurat.

## Fitur Utama

### 1. Validasi GSA ID
- Menggunakan database `all-member-data.json` sebagai sumber kebenaran
- Hanya GSA ID yang terdaftar dalam database yang bisa digunakan
- Indikator visual (✓/✗) untuk menunjukkan status validasi

### 2. Auto-Complete Data
- Ketika GSA ID valid dimasukkan, nama dan kampus otomatis terisi
- Data diambil langsung dari database resmi
- Mencegah typo dan kesalahan input

### 3. Validasi Nama & Kampus
- Nama harus sesuai dengan data yang terdaftar (toleransi 80% similarity)
- Kampus harus sesuai dengan data yang terdaftar (toleransi 75% similarity)
- Menggunakan algoritma Levenshtein distance untuk mendeteksi typo

### 4. Popup Validasi
- Menampilkan error jika data tidak sesuai
- Memberikan saran data yang benar
- Opsi untuk menggunakan data yang benar secara otomatis

## Komponen Baru

### `lib/member-validation.ts`
- `validateMemberData()`: Validasi lengkap data member
- `getAutoCompleteData()`: Auto-complete nama dan kampus
- `getAllValidGsaIds()`: Mendapatkan semua GSA ID yang valid
- `calculateSimilarity()`: Menghitung similarity untuk toleransi typo

### `components/MemberValidationPopup.tsx`
- Popup untuk menampilkan error validasi
- Menampilkan saran data yang benar
- Opsi untuk menerima saran otomatis

## Keamanan
- Mencegah registrasi dengan data palsu
- Memastikan konsistensi data dengan database resmi
- Toleransi typo yang wajar tanpa mengorbankan keamanan

## User Experience
- Feedback real-time saat input GSA ID
- Auto-complete untuk mengurangi kesalahan
- Indikator visual yang jelas
- Pesan error yang informatif dengan saran perbaikan
