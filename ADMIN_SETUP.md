# Membuat admin pertama
1. Daftarkan akun pelanggan dari aplikasi.
2. Di phpMyAdmin, buat hash password menggunakan PHP password_hash() di file sementara di hosting; hapus file sementara segera setelah digunakan.
3. Jalankan SQL berikut dengan email akunmu dan hash yang dihasilkan:
   UPDATE ss2_users SET role='admin', password_hash='TEMPEL_HASH_DI_SINI' WHERE email='EMAIL_AKUN_KAMU';
4. Login ulang. Jangan izinkan pengguna mendaftar sendiri sebagai admin. Jangan gunakan password default.
