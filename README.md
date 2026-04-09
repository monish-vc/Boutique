# 🧵 Sri Sri Boutique — E-commerce PWA

A premium boutique e-commerce website built with React, Vite, Tailwind CSS, and Supabase.

## Features

- **Customer:** Browse, filter, sort products; add to cart; buy via WhatsApp
- **Admin:** Dashboard with analytics, product CRUD, image uploads
- **PWA:** Installable, offline support, fast loading
- **Security:** RLS policies, input sanitization, route protection

---

## 🚀 Setup Guide (Step-by-Step)

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **Anon Key** from Settings → API

### 2. Run the Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Open the file `supabase-schema.sql` from this project
3. Copy the entire contents and run it in the SQL Editor
4. This creates: `profiles`, `products`, `analytics` tables + storage bucket + RLS policies

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Install & Run

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Create Your Admin Account

1. Open the app and go to **Login**
2. Sign up with your email
3. Go to Supabase **SQL Editor** and run:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

4. Sign out and sign back in — you now have admin access!

### 6. Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
sri-sri-boutique/
├── public/
│   ├── favicon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── components/
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── WhatsAppButton.jsx
│   ├── context/
│   │   ├── authStore.js
│   │   └── cartStore.js
│   ├── lib/
│   │   ├── constants.js
│   │   ├── sanitize.js
│   │   └── supabase.js
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminProductForm.jsx
│   │   ├── AdminProducts.jsx
│   │   ├── Cart.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── NotFound.jsx
│   │   ├── ProductDetail.jsx
│   │   └── Shop.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
├── postcss.config.js
├── supabase-schema.sql
├── tailwind.config.js
└── vite.config.js
```

---

## 🔒 Security Implemented

| Feature | Implementation |
|---------|---------------|
| Environment Variables | Supabase keys in `.env`, never hardcoded |
| Input Validation | All forms validated before submission |
| XSS Protection | DOMPurify sanitizes all user inputs |
| Route Protection | Admin routes require admin role |
| RLS Policies | Only admins can modify products |
| Error Handling | Toast messages + graceful fallbacks |
| Async Safety | All promises handled with try/catch |

---

## 📱 PWA Features

- Installable on mobile and desktop (Add to Home Screen)
- Service Worker with asset caching
- Offline fallback
- Lighthouse PWA compliant

---

## 📞 Contact

**Sri Sri Boutique**
📧 srisrirajiboutique@gmail.com
📱 +91 9442270086
📍 Pollachi, Tamil Nadu - 642003
