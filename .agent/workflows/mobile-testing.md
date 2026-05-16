---
description: How to test the Lumen Tarot app on mobile devices (iOS/Android)
---

# Mobile Testing Workflow

## 1. Supabase Redirect Fix
To fix the issue where Gmail login redirects you away from your local testing site:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Go to **Authentication** -> **URL Configuration**.
4. In the **Redirect URLs** section, click **Add URL**.
5. Add `http://localhost:5173` (and your local network IP if testing on a physical device, e.g., `http://192.168.1.100:5173`).
6. Click **Save**.

## 2. Syncing Changes to Mobile
Every time you make a change to the code, you need to sync it to the mobile project:
// turbo
1. Build the web app: `npm run build`
// turbo
2. Sync to Capacitor: `npx cap sync`

## 3. Launching the App
### iOS (requires macOS and Xcode)
// turbo
- `npx cap open ios` (Opens Xcode)
- Or run directly: `npx cap run ios`

### Android (requires Android Studio)
// turbo
- `npx cap open android` (Opens Android Studio)
- Or run directly: `npx cap run android`

## 4. Live Reload (Recommended for Development)
To see changes instantly on your mobile device without rebuilding:
1. Find your computer's local IP address.
2. Update `capacitor.config.ts`:
```typescript
const config: CapacitorConfig = {
  // ... existing config
  server: {
    url: "http://YOUR_LOCAL_IP:5173",
    cleartext: true
  }
};
```
3. Run `npx cap sync`.
4. Run `npm run dev -- --host`.
5. Run the app on your device.
