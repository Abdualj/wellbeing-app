# 📱 Progressive Web App (PWA) Setup

## ✅ What's Been Implemented

Your WellSpring app is now a **Progressive Web App** with the following features:

### 🎯 Core PWA Features

1. **Service Worker Registration**
   - Automatic updates
   - Offline caching
   - Background sync capability

2. **Web App Manifest**
   - Installable on mobile and desktop
   - Custom splash screen
   - Theme colors and branding
   - Multiple icon sizes (64x64, 192x192, 512x512)
   - Maskable icons for adaptive displays

3. **Install Prompt**
   - Smart install banner
   - iOS-specific instructions
   - Dismissable with 7-day cooldown
   - Automatic detection of installation

4. **Offline Support**
   - API response caching (24 hours)
   - Image caching (30 days)
   - Static asset caching

## 🚀 How to Test PWA Features

### Desktop (Chrome/Edge)

1. Run `npm run dev` or `npm run build && npm run preview`
2. Open DevTools → Application → Manifest
3. Check "Service Workers" section
4. Click the install icon in the address bar

### Mobile Testing

1. Deploy to Netlify
2. Open on mobile browser
3. Look for "Add to Home Screen" prompt
4. Or use Chrome: Menu → Add to Home Screen

### PWA Audit

```bash
# Build the app first
npm run build

# Preview the built app
npm run preview

# Run Lighthouse audit in Chrome DevTools
# Performance → Lighthouse → Progressive Web App
```

## 📦 Files Added/Modified

### New Files

- `generate-icons.js` - PWA icon generator
- `src/components/PWAInstallPrompt.jsx` - Install prompt UI
- `public/pwa-*.png` - PWA icons (auto-generated)
- `public/apple-touch-icon.png` - iOS icon
- `public/favicon.ico` - Browser favicon

### Modified Files

- `vite.config.js` - PWA plugin configuration
- `index.html` - PWA meta tags
- `src/main.jsx` - Service worker registration
- `src/App.css` - Animation styles
- `package.json` - Build scripts

## 🎨 PWA Icons

Icons are automatically generated from `logo/wellspring-logo.png`:

```bash
npm run generate-icons
```

This creates:

- `pwa-64x64.png`
- `pwa-192x192.png`
- `pwa-512x512.png`
- `maskable-icon-512x512.png`
- `apple-touch-icon.png`
- `favicon.ico`

## 🌐 Manifest Configuration

Located in `vite.config.js`:

```javascript
{
  name: 'WellSpring - Sustainable Wellbeing Community',
  short_name: 'WellSpring',
  description: 'Community platform for sustainable wellbeing...',
  theme_color: '#86A789',
  background_color: '#F5F5DC',
  display: 'standalone'
}
```

## 📱 Installation Experience

### Android/Chrome

- Install prompt appears automatically
- Click "Install" button
- App appears in app drawer
- Launches in standalone mode

### iOS/Safari

- Tap share button
- Select "Add to Home Screen"
- App icon appears on home screen
- Manual instructions shown in app

## 🔧 Customization

### Change Theme Color

Update in `vite.config.js`:

```javascript
theme_color: '#86A789', // Your brand color
background_color: '#F5F5DC', // Background color
```

### Modify Install Prompt

Edit `src/components/PWAInstallPrompt.jsx`:

- Change timing: `setTimeout(..., 3000)` (line 46)
- Modify dismiss period: `daysSinceDismissed < 7` (line 34)
- Update UI/styling

### Add Offline Pages

Edit `vite.config.js` → `workbox.runtimeCaching`:

```javascript
{
  urlPattern: /^https:\/\/your-api\.com/,
  handler: 'NetworkFirst', // or CacheFirst, StaleWhileRevalidate
}
```

## ✅ PWA Checklist for Assignment

- [x] Web App Manifest configured
- [x] Service Worker registered
- [x] Installable on mobile/desktop
- [x] Offline support enabled
- [x] Custom install prompt
- [x] Theme colors set
- [x] Icons for all sizes
- [x] Meta tags for SEO
- [x] Works as standalone app

## 🚀 Deployment to Netlify

### Build Settings

```
Build command: npm run build
Publish directory: dist
```

### Environment Variables

Add in Netlify dashboard:

```
VITE_API_URL=https://your-backend-url.com
```

### netlify.toml (Optional)

Create in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/manifest.webmanifest"
  [headers.values]
    Content-Type = "application/manifest+json"
```

## 📊 Testing Checklist

- [ ] Service worker registers successfully
- [ ] App is installable
- [ ] Install prompt appears
- [ ] Icons display correctly
- [ ] Offline mode works
- [ ] Updates work automatically
- [ ] Lighthouse PWA score > 90
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome
- [ ] Splash screen shows correct branding

## 🎯 Assignment Compliance

✅ **"React SPA/PWA + REST API backend"** - FULLY IMPLEMENTED

This app now meets the PWA requirements for your Monialustaprojekti TX00EY70-3003 assignment!

## 📚 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox](https://developers.google.com/web/tools/workbox)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
