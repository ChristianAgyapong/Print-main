# 🎨 PrintCraft - Supabase Integration Setup

This app is fully integrated with Supabase for backend services including authentication, database, and storage.

## 🚀 Quick Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - **Name**: PrintCraft (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
   - **Pricing Plan**: Free tier is perfect to start

### 2. Get Your API Keys

1. Once your project is ready, go to **Project Settings** (gear icon)
2. Navigate to **API** section
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 3. Configure Your App

1. Open `.env` file in the project root
2. Replace the placeholder values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Set Up Authentication

In your Supabase dashboard:

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (enabled by default)
3. (Optional) Enable **Google** and **Apple** for OAuth:
   - Configure redirect URLs
   - Add OAuth credentials

### 5. Database Tables (Optional - for future features)

Create tables for your printing shop data:

```sql
-- Customers profile extension
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Products table (printing services)
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Orders policies
CREATE POLICY "Users can view own orders" 
  ON orders FOR SELECT 
  USING (auth.uid() = user_id);

-- Products policies (public read)
CREATE POLICY "Anyone can view products" 
  ON products FOR SELECT 
  TO PUBLIC 
  USING (true);
```

### 6. Storage Buckets (Optional - for images)

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket called `product-images`
3. Set it to **Public** if you want public access to product images
4. Create policies for upload permissions

## 📱 Features Implemented

### ✅ Authentication
- Email/Password Sign Up
- Email/Password Sign In  
- Password Reset
- OAuth (Google, Apple) - ready for configuration
- Session Management
- Auto token refresh
- Secure token storage

### 🔐 Security
- Row Level Security (RLS) ready
- JWT token authentication
- Secure password storage
- HTTPS only connections

## 🛠️ Available Auth Methods

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { 
  user,           // Current user object
  session,        // Current session
  loading,        // Loading state
  signUp,         // Sign up with email/password
  signIn,         // Sign in with email/password
  signOut,        // Sign out
  signInWithGoogle,  // OAuth Google
  signInWithApple,   // OAuth Apple
  resetPassword   // Password reset
} = useAuth();
```

## 📝 Usage Examples

### Sign Up
```typescript
const { error } = await signUp(email, password, fullName);
```

### Sign In
```typescript
const { error } = await signIn(email, password);
```

### Sign Out
```typescript
await signOut();
```

### Check if User is Authenticated
```typescript
if (user) {
  // User is logged in
  console.log('User:', user.email);
}
```

## 🔄 Next Steps

1. **Add database queries**: Use Supabase client to fetch/create data
2. **File uploads**: Implement image uploads for designs
3. **Real-time updates**: Add real-time order status updates
4. **Push notifications**: Configure FCM for order updates
5. **Analytics**: Track user behavior and conversions

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage](https://supabase.com/docs/guides/storage)

## 🆘 Troubleshooting

### Environment variables not loading
- Restart the Expo dev server after changing `.env`
- Make sure variable names start with `EXPO_PUBLIC_`

### Authentication errors
- Check your Supabase URL and keys are correct
- Verify email settings in Supabase dashboard
- Check Supabase logs in the dashboard

### CORS errors
- Add your app URL to allowed origins in Supabase settings
- For local development: `exp://` URLs are automatically allowed

---

**Need Help?** Check the Supabase documentation or open an issue!
