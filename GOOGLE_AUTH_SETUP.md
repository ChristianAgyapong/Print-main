# Google OAuth Setup for Supabase

## ✅ Steps Completed in Your App

Your app is now configured to handle Google OAuth authentication!

## 🔧 Configure Redirect URLs in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. In the **Redirect URLs** section, add these URLs (one per line):

### Critical: Add ALL of these redirect URLs:
```
printapp://auth/callback
printapp://
exp://localhost:8081
exp://localhost:8081/--/auth/callback
http://localhost:8081
http://localhost:19006
```

**Important Notes:**
- The app will automatically choose the right redirect URL based on your environment
- For Expo Go development, it uses `exp://` URLs
- For production builds, it uses `printapp://auth/callback`
- Add your computer's IP address if testing on a physical device: `exp://YOUR_IP:8081`

## 🌐 Configure Google OAuth Provider in Supabase

1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - **Client ID**: Get from Google Cloud Console
   - **Client Secret**: Get from Google Cloud Console

## 📱 How to Get Google OAuth Credentials

### Step 1: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**

### Step 2: Create OAuth 2.0 Client ID
1. Click **Create Credentials** → **OAuth client ID**
2. Select **Web application**
3. Add **Authorized redirect URIs**:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
   Replace `your-project` with your actual Supabase project reference

4. Copy the **Client ID** and **Client Secret**

### Step 3: Add to Supabase
1. Paste Client ID and Client Secret in Supabase Google provider settings
2. Save the configuration

## 🎯 Testing Google Sign-In

1. Run your app: `npm start`
2. Click "Continue with Google" button
3. A browser will open for Google authentication
4. After successful login, you'll be redirected back to the app
5. User will be automatically signed in!

## 📝 Important Notes

- **Development**: Uses Expo's deep linking (exp://)
- **Production**: Uses your app's custom scheme (printapp://)
- The app automatically opens a browser for authentication
- After auth, Google redirects back to your app
- Session is automatically managed by Supabase

## 🔍 Troubleshooting

### "Redirect URL mismatch" error:
- Ensure all redirect URLs are added in Supabase dashboard
- Check that scheme in app.json matches: `"scheme": "printapp"`

### Browser doesn't open:
- Check expo-web-browser is installed
- Restart the development server

### Session not persisting:
- Verify AsyncStorage is properly configured
- Check Supabase URL and anon key in .env file

## 🚀 What Was Implemented

✅ Expo Web Browser for OAuth flow  
✅ Deep linking for app redirects  
✅ Automatic session management  
✅ Google OAuth integration  
✅ Apple OAuth integration (ready for configuration)  
✅ Error handling and user feedback  

Your Google authentication is now fully functional! Just add the redirect URLs in Supabase and you're ready to go! 🎉
