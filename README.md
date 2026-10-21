# Shinta Shop APK starter
Arsitektur: aplikasi Android Capacitor + frontend Vite, backend PHP/MySQL di hosting terpisah, APK dibangun GitHub Actions.

## Mulai
1. Upload isi ZIP ini ke repository GitHub baru (branch `main`).
2. Upload folder `backend/` ke hosting PHP, misalnya `htdocs/shinta-api/`.
3. Import `database/schema.sql` ke database hosting. Schema hanya membuat tabel baru berawalan `ss2_`, tidak menghapus tabel lama.
4. Edit `backend/config.php` di hosting dengan kredensial database dan APP_SECRET acak panjang. Jangan pernah commit kredensial asli ke GitHub.
5. Edit `app/.env.production`: isi URL HTTPS endpoint API dan nomor WhatsApp.
6. Push/commit ke GitHub, buka Actions, jalankan `Build Android APK`, unduh artifact `shinta-shop-debug-apk`.
7. APK debug untuk tes pribadi. Uji API, login, order dan keamanan sebelum dipakai pelanggan sungguhan.

Catatan: starter ini belum diuji di hosting milikmu. URL API, database, dan akun admin harus dikonfigurasi terlebih dahulu. Pembayaran online belum termasuk.
