# Panduan Setup Supabase untuk BluePin Messenger

## Langkah 1: Buat Project Supabase

1. Buka [https://supabase.com](https://supabase.com)
2. Klik **"Start your project"** atau **"New Project"**
3. Isi data project:
   - **Name**: `bluepin-messenger` (atau nama lain)
   - **Database Password**: Pilih password yang kuat (simpan baik-baik!)
   - **Region**: Pilih yang terdekat dengan Anda (contoh: Singapore, Tokyo)
4. Klik **"Create new project"**
5. Tunggu beberapa menit hingga project selesai dibuat

## Langkah 2: Dapatkan Credentials API

1. Di dashboard Supabase, klik menu **"Settings"** (ikon gear di sidebar kiri bawah)
2. Klik **"API"**
3. Salin kedua nilai berikut:
   - **Project URL** (contoh: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (contoh: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Langkah 3: Setup Environment Variables

### Untuk Web App (`apps/web/.env`):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Untuk Mobile App (`apps/mobile/.env`):
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Penting**: Ganti `your-project-id.supabase.co` dan `your-anon-key-here` dengan nilai yang Anda salin dari Supabase!

## Langkah 4: Jalankan Database Schema

1. Di dashboard Supabase, klik menu **"SQL Editor"** di sidebar kiri
2. Klik **"New query"**
3. Copy seluruh isi file `database/schema.sql` dari project ini
4. Paste ke SQL Editor
5. Klik **"Run"** atau tekan `Ctrl+Enter`
6. Pastikan semua perintah berhasil (tidak ada error)

Schema akan membuat:
- ✅ Tabel: profiles, contacts, conversations, conversation_members, messages, message_receipts, typing_indicators, presence, notifications
- ✅ Row Level Security (RLS) policies
- ✅ Indexes untuk performa
- ✅ Triggers untuk auto-update timestamps
- ✅ Fungsi untuk generate BluePin ID

## Langkah 5: Verifikasi Setup

### Cek Tabel Database:
1. Klik menu **"Table Editor"** di sidebar
2. Anda harus melihat 9 tabel:
   - profiles
   - contacts
   - conversations
   - conversation_members
   - messages
   - message_receipts
   - typing_indicators
   - presence
   - notifications

### Cek Authentication:
1. Klik menu **"Authentication"** → **"Providers"**
2. Pastikan **Email** provider sudah enabled (default sudah aktif)

### Cek Storage (Opsional - untuk avatar):
1. Klik menu **"Storage"**
2. Klik **"New bucket"**
3. Nama bucket: `avatars`
4. Pilih **Public bucket**
5. Klik **"Create bucket"**

## Langkah 6: Test Aplikasi

### Jalankan Web App:
```bash
cd /workspace
npm run dev:web
```
Buka browser di `http://localhost:5173`

### Jalankan Mobile App:
```bash
cd /workspace
npm run dev:mobile
```
Scan QR code dengan Expo Go app di HP Anda

## Troubleshooting

### Error: "trigger already exists"
Schema sudah diperbaiki dengan `DROP TRIGGER IF EXISTS`. Anda bisa run ulang schema.sql tanpa masalah.

### Error: "relation already exists"
Jika ingin reset database:
1. Buka SQL Editor di Supabase
2. Jalankan perintah ini untuk drop semua tabel:
```sql
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS presence CASCADE;
DROP TABLE IF EXISTS typing_indicators CASCADE;
DROP TABLE IF EXISTS message_receipts CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_members CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```
3. Jalankan ulang `schema.sql`

### Error: "Invalid API key"
- Pastikan Anda menggunakan **anon public** key, bukan service_role key
- Cek tidak ada spasi ekstra di .env
- Restart development server setelah perubahan .env

### Email Verification
Secara default, Supabase memerlukan email verification. Untuk development:
1. Buka **Authentication** → **Providers** → **Email**
2. Disable **"Confirm email"**
3. Atau gunakan email tester seperti [mailtrap.io](https://mailtrap.io)

## Next Steps

Setelah setup selesai:
1. ✅ Register akun pertama Anda
2. ✅ Login dengan credentials
3. ✅ Update profile (avatar, display name, bio)
4. 🔄 Implementasi contact system
5. 🔄 Implementasi real-time chat
6. 🔄 Implementasi group features

Selamat mengembangkan BluePin Messenger! 🚀
