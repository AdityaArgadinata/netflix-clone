# Google OAuth Setup Guide for Supabase

## ✅ Features Added:
- Sign In with Google button (Netflix-style UI)
- Sign Up with Google button (Netflix-style UI)
- OAuth callback handler (`/auth/callback`)
- Divider between OAuth and Email methods

## 🔧 Setup Steps:

### 1. Create Google OAuth Credentials

Go to [Google Cloud Console](https://console.cloud.google.com/):

1. Create a new project or select existing one
2. Go to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "OAuth 2.0 Client ID"
4. Choose "Web application"
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`
6. Copy the **Client ID** and **Client Secret**

### 2. Configure Supabase OAuth Provider

1. Go to Supabase Dashboard
2. Navigate to Authentication > Providers
3. Find "Google" provider
4. Enable it (toggle ON)
5. Paste **Client ID** in the first field
6. Paste **Client Secret** in the second field
7. Save

### 3. Configure Supabase Redirect URLs

1. In Supabase, go to Authentication > URL Configuration
2. Add Site URL:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

3. Add Redirect URLs:
   ```
   http://localhost:3000
   http://localhost:3000/auth/callback
   http://localhost:3000/sign-in
   http://localhost:3000/sign-up
   ```

### 4. Update Environment Variables (if needed)

Your `.env.local` already has:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

These are all you need. Google credentials are managed in Supabase.

## 🧪 Test Google OAuth:

1. Start development server:
   ```bash
   npm run dev
   ```

2. Go to `/sign-in` or `/sign-up`

3. Click "**Continue with Google**" button

4. You'll be redirected to Google login

5. After authenticating, you'll be redirected back to home page

## 🎨 UI Features:

- ✅ Google button with official Google colors and logo
- ✅ Divider between OAuth and Email methods (Netflix-style)
- ✅ Loading states during authentication
- ✅ Error handling with clear messages
- ✅ Responsive design
- ✅ Dark theme matching Netflix aesthetic

## 📌 Callback Flow:

```
User clicks "Continue with Google"
    ↓
Redirects to Google login
    ↓
User authenticates with Google
    ↓
Google redirects to /auth/callback with code
    ↓
Route exchanges code for session
    ↓
Redirects to home page (authenticated)
```

## ⚠️ Common Issues:

1. **"Redirect URI mismatch"** - Check Supabase URL Configuration
2. **"Google sign-in not working"** - Verify Client ID/Secret in Supabase
3. **"Blank page after Google auth"** - Check browser console for errors

## 🚀 Production Notes:

- Update redirect URLs when deploying
- Use environment variables for different environments
- Test Google sign-in before going live
- Monitor authentication logs in Supabase

Enjoy! 🎬
