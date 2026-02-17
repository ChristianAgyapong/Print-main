# 🎨 PrintCraft - Custom Printing Designs Shop

A modern React Native mobile app for a custom printing designs shop, built with Expo and Supabase.

## ✨ Features

- 🎨 **Beautiful Landing Page** - Eye-catching design showcasing your printing services
- 🔐 **Complete Authentication** - Sign up, sign in, password reset, OAuth (Google, Apple)
- 📱 **Responsive Design** - Works perfectly on all phone sizes
- 🚀 **Supabase Backend** - Full backend integration ready for your API
- 💾 **Secure Storage** - Token management with AsyncStorage
- 🎯 **User Profiles** - Customer account management
- 📦 **Ready for Orders** - Database structure for products and orders

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

See **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** for detailed setup instructions.

Quick steps:
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Update `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start the app

```bash
npx expo start
```

Choose your platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator  
- Scan QR code with Expo Go app

## 📁 Project Structure

```
print-app/
├── app/                    # Main app screens (file-based routing)
│   ├── index.tsx          # Landing page
│   ├── auth.tsx           # Authentication screen
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout with providers
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── lib/                   # Utilities and configs
│   ├── supabase.ts       # Supabase client configuration
│   └── database-examples.md  # Database usage examples
├── components/            # Reusable components
├── constants/            # App constants and themes
└── assets/               # Images and static files
```

## 🎯 App Flow

1. **Landing Page** → Beautiful introduction to PrintCraft
2. **Auth Screen** → Sign up or sign in
3. **Main App** → Browse products, place orders, manage profile

## 🔐 Authentication

The app includes complete authentication powered by Supabase:

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, signIn, signUp, signOut } = useAuth();

// Sign up
await signUp(email, password, fullName);

// Sign in
await signIn(email, password);

// Sign out
await signOut();
```

## 💾 Database Setup

Run this SQL in your Supabase SQL Editor to create tables:

```sql
-- See SUPABASE_SETUP.md for complete SQL schema
```

## 🎨 Customization

### Colors
The app uses a modern color palette in [app/index.tsx](app/index.tsx):
- Primary: `#FF006E` (Magenta)
- Background: `#0F0F1E` (Dark Navy)
- Accents: `#8338EC` (Purple), `#3A86FF` (Blue)

### Branding
Update the logo and app name in:
- Landing page: [app/index.tsx](app/index.tsx)
- Auth screen: [app/auth.tsx](app/auth.tsx)

### Branding
Update the logo and app name in:
- Landing page: [app/index.tsx](app/index.tsx)
- Auth screen: [app/auth.tsx](app/auth.tsx)

## 📦 Tech Stack

- **Framework**: [Expo](https://expo.dev) / React Native
- **Language**: TypeScript
- **Backend**: [Supabase](https://supabase.com)
- **Authentication**: Supabase Auth
- **Storage**: AsyncStorage
- **Navigation**: Expo Router
- **Icons**: Expo Vector Icons

## 🛠️ Available Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run lint       # Run ESLint
```

## 📚 Documentation

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Complete Supabase setup guide
- **[lib/database-examples.md](./lib/database-examples.md)** - Database usage examples

## 🚀 Next Steps

1. ✅ Configure Supabase (see SUPABASE_SETUP.md)
2. 📱 Customize your branding and colors
3. 🗄️ Set up database tables for products and orders
4. 🖼️ Add product images and descriptions
5. 💳 Integrate payment processing
6. 📧 Set up email templates in Supabase
7. 🔔 Add push notifications
8. 📊 Implement analytics

## 🆘 Need Help?

- Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for backend setup
- Check [lib/database-examples.md](./lib/database-examples.md) for code examples
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)

## 📝 License

This project is ready for your custom printing shop business!

---

**Built with ❤️ for PrintCraft**
