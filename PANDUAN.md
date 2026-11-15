# Panduan Pasang Kasir Toko Berkah Jaya

## 1. Siapkan Google Spreadsheet (database)
1. Buka sheets.google.com → buat spreadsheet baru, beri nama "Database Kasir Berkah Jaya".
2. Menu **Extensions (Ekstensi) → Apps Script**.
3. Hapus isi editor, tempel seluruh isi file `Code.gs`.
4. Ganti `TOKEN` di baris atas dengan kata sandi rahasia Anda sendiri.
5. Pilih fungsi `setup` lalu klik **Run** (izinkan akses saat diminta). Sheet Barang, StokMasuk, Penjualan, DetailPenjualan akan terbuat.
6. Klik **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Salin **Web app URL** (berakhiran `/exec`).

## 2. Pasang aplikasi di HP Android
1. Aplikasi harus ditaruh di alamat HTTPS agar bisa dipasang & jalan offline. Cara termudah dan gratis:
   - Buka **app.netlify.com/drop**, seret folder berisi `index.html`, `sw.js`, `manifest.json`, `icon.svg`. Anda dapat alamat web.
   - (Alternatif: GitHub Pages.)
2. Buka alamat itu di **Chrome Android** (sekali saat ada internet).
3. Menu ⋮ → **Install app / Tambahkan ke layar utama**.
4. Setelah itu aplikasi bisa dibuka tanpa internet.

## 3. Hubungkan ke Spreadsheet
Di aplikasi: tab **Pengaturan** → isi URL Web App dan Token yang sama → **Simpan** → **Sinkron Sekarang**.

Setelah itu sinkron berjalan otomatis setiap ada transaksi/perubahan dan saat HP kembali online. Saat offline, data disimpan di HP dan masuk antrean.

## 4. Cetak nota
- Tombol **Cetak** memakai menu cetak Android. Pilih printer WiFi/Bluetooth Anda.
- Untuk printer thermal Bluetooth 58/80 mm, pasang aplikasi plugin printer (mis. **RawBT**) lalu pilih sebagai printer di menu cetak.
- Atur lebar kertas (58/80 mm), alamat, dan telepon toko di Pengaturan.

## 5. Export
- **Excel**: tombol ⬇ Excel (Barang & Laporan) → file `.xls`. Excel mungkin menampilkan peringatan format, pilih **Yes/Buka**. File juga bisa dibuka di WPS Office dan Google Sheets.
- **PDF**: tombol ⬇ PDF → pada menu cetak pilih **Simpan sebagai PDF**.

## Catatan
- Disarankan 1 HP kasir utama. Jika dipakai beberapa HP, perubahan stok dari HP berbeda bisa saling menimpa (data terbaru menang).
- Lakukan **Backup (JSON)** di Pengaturan secara berkala.
