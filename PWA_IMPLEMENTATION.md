# PWA Implementation Guide

This document describes the Progressive Web Application (PWA) features that have been implemented in Analog Calendar.

## Overview

The PWA implementation includes:

- **Web App Manifest**: Allows users to install the app on their home screen
- **Service Worker**: Enables push notifications
- **Push Notifications**: Server-side push notification support with tRPC
- **Database Persistence**: Push subscriptions are stored in the database
- **Security Headers**: Enhanced security for PWA features

## Setup Instructions

### 1. Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for web push notifications.

```bash
# Install web-push globally (if not already installed)
npm install -g web-push

# Generate VAPID keys
npx web-push generate-vapid-keys
```

This will output something like:

```
=======================================
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U

Private Key:
UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls
=======================================
```

### 2. Configure Environment Variables

Add the generated VAPID keys to your `.env` file:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U
VAPID_PRIVATE_KEY=UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls
```

**Important**: Keep the private key secret! Never commit it to version control.

### 3. Run Database Migration

The PWA implementation adds a new `push_subscription` table to store user push notification subscriptions.

```bash
# Generate the migration
bun run db:generate

# Apply the migration
bun run db:migrate
```

### 4. Create PWA Icons

You need to create the following icon files and place them in the `apps/web/public/` directory:

- `icon-192x192.png` - 192x192px icon
- `icon-512x512.png` - 512x512px icon
- `icon-192x192-maskable.png` - 192x192px maskable icon
- `icon-512x512-maskable.png` - 512x512px maskable icon

See `apps/web/public/PWA_ICONS_README.md` for detailed instructions on creating these icons.

**Tools for generating icons:**

- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [Maskable App Tool](https://maskable.app/)

### 5. Start the Development Server

```bash
# For local HTTPS testing (recommended for PWA features)
bun run dev --experimental-https

# Or regular HTTP
bun run dev
```

## Features

### 1. App Installation

Users can install Analog Calendar as a Progressive Web App:

- **Desktop (Chrome/Edge)**: Click the install button in the address bar
- **Mobile (Android)**: Tap "Add to Home Screen" from the browser menu
- **Mobile (iOS)**: Tap the share button and select "Add to Home Screen"

The app includes an `InstallPrompt` component that guides users through the installation process.

### 2. Push Notifications

Users can subscribe to push notifications through the app:

1. Navigate to the settings or notification management page
2. Click "Subscribe" to enable push notifications
3. Grant permission when prompted by the browser
4. Send test notifications to verify functionality

**Browser Support:**

- Chrome/Edge (Desktop & Android): Full support
- Safari (iOS 16.4+ & macOS 13+): Full support
- Firefox (Desktop & Android): Full support

### 3. Using the PWA Components

Import and use the PWA components in your app:

```tsx
import { InstallPrompt, PushNotificationManager } from "@/components/pwa";

export default function SettingsPage() {
  return (
    <div>
      <InstallPrompt />
      <PushNotificationManager />
    </div>
  );
}
```

## API Reference

### tRPC Router: `pushNotifications`

The push notifications functionality is exposed through the tRPC API:

#### `pushNotifications.subscribe`

Subscribe to push notifications.

```typescript
const subscription = await trpc.pushNotifications.subscribe.mutate({
  endpoint: "https://...",
  keys: {
    p256dh: "...",
    auth: "...",
  },
  expirationTime: null,
});
```

#### `pushNotifications.unsubscribe`

Unsubscribe from all push notifications for the current user.

```typescript
await trpc.pushNotifications.unsubscribe.mutate();
```

#### `pushNotifications.send`

Send a push notification to the current user's subscribed devices.

```typescript
await trpc.pushNotifications.send.mutate({
  title: "New Event",
  body: "You have a meeting in 15 minutes",
  icon: "/icon-192x192.png",
});
```

#### `pushNotifications.list`

List all push subscriptions for the current user.

```typescript
const subscriptions = await trpc.pushNotifications.list.query();
```

## Database Schema

### `push_subscription` Table

```typescript
{
  id: string (primary key)
  userId: string (foreign key to user.id)
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  expirationTime: timestamp | null
  createdAt: timestamp
  updatedAt: timestamp
}
```

Indexes:

- `push_subscription_user_id_idx` on `userId`
- `push_subscription_endpoint_idx` on `endpoint`

## Security Considerations

### 1. VAPID Keys

- The public key is safe to expose in client-side code
- The private key must be kept secret on the server
- Never commit the private key to version control
- Rotate keys periodically for security

### 2. Security Headers

The following security headers are automatically configured:

**Global Headers:**

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

**Service Worker Headers:**

- `Content-Type: application/javascript; charset=utf-8`
- `Cache-Control: no-cache, no-store, must-revalidate`
- `Content-Security-Policy: default-src 'self'; script-src 'self'`

### 3. HTTPS Requirement

PWAs require HTTPS in production. For local development:

```bash
# Use Next.js experimental HTTPS
bun run dev --experimental-https
```

### 4. User Permissions

Push notifications require explicit user permission. The browser will prompt users to grant or deny permission when they attempt to subscribe.

## Testing

### Local Testing

1. Start the dev server with HTTPS:

   ```bash
   bun run dev --experimental-https
   ```

2. Open the app in a supported browser (Chrome recommended)

3. Navigate to the notifications settings page

4. Subscribe to push notifications

5. Send a test notification

### Browser DevTools

**Chrome DevTools:**

1. Open DevTools (F12)
2. Go to Application → Service Workers
3. Verify the service worker is registered
4. Go to Application → Manifest
5. Verify the manifest is valid

**Testing Push Notifications:**

1. Open DevTools → Application → Service Workers
2. Find your service worker
3. Use "Push" button to simulate a push event
4. Or use the test notification feature in the app

## Troubleshooting

### Service Worker Not Registering

- Ensure you're serving over HTTPS (or localhost)
- Check browser console for errors
- Verify the service worker file is accessible at `/sw.js`

### Push Notifications Not Working

- Verify VAPID keys are correctly configured
- Check that browser notifications are enabled
- Ensure the user has granted notification permissions
- Check browser console and server logs for errors

### Icons Not Showing

- Verify icon files exist in the `public/` directory
- Check file names match those in `manifest.ts`
- Clear browser cache and reload

### Manifest Not Loading

- Verify `manifest.ts` exports a valid manifest
- Check browser console for manifest errors
- Use Chrome DevTools → Application → Manifest to debug

## Production Deployment

### Checklist

- [ ] Generate production VAPID keys
- [ ] Add VAPID keys to production environment variables
- [ ] Run database migrations in production
- [ ] Create and upload PWA icons
- [ ] Ensure production site is served over HTTPS
- [ ] Test PWA installation on production
- [ ] Test push notifications on production
- [ ] Monitor service worker updates

### Vercel Deployment

If deploying to Vercel, the environment variables can be set in the Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
3. Add `VAPID_PRIVATE_KEY`
4. Redeploy the application

## Future Enhancements

Potential improvements to consider:

1. **Offline Support**: Add caching strategies for offline functionality
2. **Background Sync**: Queue actions when offline and sync when online
3. **Periodic Background Sync**: Update calendar data in the background
4. **Web Share API**: Share events with other apps
5. **Badging API**: Show unread notifications count on the app icon
6. **Push Notification Actions**: Add buttons to notifications (e.g., "Snooze", "View")

## Resources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev: PWA](https://web.dev/progressive-web-apps/)
- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
- [Next.js: Progressive Web Apps](https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps)
