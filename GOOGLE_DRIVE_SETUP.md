# Panduan Setup Integrasi Google Drive 

Kami telah mengonfigurasi dan mengimpor file kredensial Service Account yang Anda sediakan. Berikut adalah langkah ringkas yang perlu Anda lakukan sekarang agar sistem sinkronisasi Google Drive berjalan otomatis.

---

## 🛠️ Status Konfigurasi Saat Ini

| Langkah Setup | Status | Detail / Catatan |
| :--- | :---: | :--- |
| **1. Buat Service Account Google Cloud** | **SELESAI ✓** | Menggunakan project `nettas-2026`. |
| **2. Daftarkan Key JSON ke Project** | **SELESAI ✓** | Disimpan otomatis di variabel `GOOGLE_SERVICE_ACCOUNT_JSON` pada `.env.local`. |
| **3. Buat & Bagikan Folder Google Drive** | **BELUM ⏳** | **Harus dilakukan oleh Anda** (lihat instruksi di bawah). |
| **4. Tambahkan Folder ID ke .env.local** | **BELUM ⏳** | **Harus dilakukan oleh Anda** (lihat instruksi di bawah). |

---

## 📋 Langkah Yang Harus Anda Lakukan Sekarang

### Langkah A: Siapkan & Bagikan Folder Google Drive Anda

Agar Service Account milik sistem (`photbooth-service-account@nettas-2026.iam.gserviceaccount.com`) dapat mengunggah foto ke akun Google Drive Anda, berikan izin Editor pada folder tujuan:

1. Buka [Google Drive](https://drive.google.com/) Anda.
2. Buat sebuah folder baru (misalnya: `Foto AI Photobooth`).
3. Klik kanan pada folder tersebut, pilih **Share** (Bagikan).
4. Masukkan alamat email Service Account berikut:
   ```text
   photbooth-service-account@nettas-2026.iam.gserviceaccount.com
   ```
5. Pastikan hak akses diatur sebagai **Editor**, matikan opsi "Notify people" (opsional agar tidak masuk spam), lalu klik **Share**.

---

### Langkah B: Dapatkan Folder ID

Setiap folder di Google Drive memiliki kode identitas unik (Folder ID) yang ada di URL browser Anda.

1. Buka folder Google Drive yang baru Anda buat tadi.
2. Perhatikan address bar browser Anda. URL-nya akan terlihat seperti ini:
   ```text
   https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456
   ```
3. Salin kode yang berada setelah `/folders/` (dalam contoh di atas, kodenya adalah `1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456`).

---

### Langkah C: Masukkan Folder ID ke `.env.local`

1. Buka file bernama `.env.local` di root folder project ini.
2. Tambahkan baris baru di bagian paling bawah seperti ini:
   ```env
   # Google Drive Folder ID
   GOOGLE_DRIVE_FOLDER_ID="1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456"
   ```
   *(Ganti `1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456` dengan Folder ID asli milik Anda).*

---

## 🔍 Cara Pengujian & Uji Coba

Setelah Langkah A, B, dan C selesai:

1. Jalankan development server photobooth dengan command:
   ```bash
   npm run dev
   ```
2. Lakukan sesi foto uji coba sampai selesai, kemudian masuk ke halaman checkout.
3. Pindai (scan) QR Code yang muncul di layar menggunakan HP Anda.
4. Di halaman HP Anda, masukkan alamat email tujuan Anda, lalu klik **KIRIM KE GOOGLE DRIVE**.
5. Foto akan otomatis terunggah ke folder Google Drive Anda, dan Anda akan menerima email notifikasi dari Google Drive yang berisi link akses ke foto tersebut!
