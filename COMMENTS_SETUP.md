# Setup Comments Feature

Untuk menggunakan fitur komentar pada halaman detail film, ikuti langkah-langkah berikut:

## 1. Create Supabase Table

Di Supabase dashboard, buka SQL Editor dan jalankan query berikut:

```sql
-- Create movie_comments table
CREATE TABLE movie_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id integer NOT NULL,
  movie_title text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  user_name text NOT NULL,
  text text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT movie_comment_unique UNIQUE(movie_id, user_id, created_at)
);

-- Create index for faster queries
CREATE INDEX movie_comments_movie_id_idx ON movie_comments(movie_id);
CREATE INDEX movie_comments_created_at_idx ON movie_comments(created_at DESC);
```

## 2. Set Row Level Security (RLS)

Pastikan RLS diaktifkan pada table `movie_comments`:

```sql
-- Enable RLS
ALTER TABLE movie_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read comments
CREATE POLICY "public_read_comments" ON movie_comments
  FOR SELECT
  USING (true);

-- Policy: Users can only insert their own comments
CREATE POLICY "users_insert_own_comments" ON movie_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own comments
CREATE POLICY "users_delete_own_comments" ON movie_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Users can only update their own comments
CREATE POLICY "users_update_own_comments" ON movie_comments
  FOR UPDATE
  USING (auth.uid() = user_id);
```

## 3. Features

- ✅ User harus login untuk memberikan komentar
- ✅ Rating 1-5 bintang
- ✅ Komentar maksimal 500 karakter
- ✅ Tampilkan user name dan tanggal komentar
- ✅ Urutkan komentar dari terbaru
- ✅ Fallback ke local state jika table tidak ada

## 4. Testing

1. Login ke aplikasi
2. Buka halaman detail film
3. Scroll ke bawah untuk melihat section "Ulasan & Komentar"
4. Isi rating, komentar, dan klik "Kirim Komentar"
5. Komentar akan muncul di daftar bawah

Enjoy!
