# 🚀 Complete PWA Deployment Guide

## Quick Deployment Options

### 🎯 Recommended: Netlify (Frontend) + Render (Backend)

**Why this combo?**

- ✅ Both have free tiers
- ✅ HTTPS by default (required for PWA)
- ✅ Easy setup
- ✅ Auto-deploy from Git
- ✅ No credit card needed initially

---

## 🔧 Pre-Deployment Setup

### 1. Build Configuration Files

First, let's create the necessary config files:

#### Create `frontend/netlify.toml`

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

# SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# PWA-specific headers
[[headers]]
  for = "/manifest.webmanifest"
  [headers.values]
    Content-Type = "application/manifest+json"
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# PWA assets
[[headers]]
  for = "/pwa-*.png"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/apple-touch-icon.png"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 📦 Deployment Steps

### Part 1: Backend Deployment (Render)

#### Step 1: Prepare Backend Code

1. **Update `package.json` scripts:**

```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "postbuild": "prisma generate"
  }
}
```

2. **Ensure TypeScript config outputs to `dist/`**

#### Step 2: Create Render Account & Deploy

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your repository
5. Configure:
   ```
   Name: wellspring-backend
   Branch: main
   Root Directory: (leave empty)
   Environment: Node
   Build Command: npm install && npm run build && npx prisma generate
   Start Command: npm start
   ```

#### Step 3: Create PostgreSQL Database

1. In Render dashboard: **"New +"** → **"PostgreSQL"**
2. Name: `wellspring-db`
3. Plan: Free
4. Click **Create Database**
5. Copy the **"Internal Database URL"**

#### Step 4: Add Environment Variables

In your web service settings, add:

```bash
DATABASE_URL=<paste-internal-database-url>
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-also-32-chars
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-app-name.netlify.app
```

#### Step 5: Run Database Migrations

After first deploy, use Render Shell:

```bash
npx prisma migrate deploy
npx prisma db seed
```

---

### Part 2: Frontend Deployment (Netlify)

#### Step 1: Update Frontend API Configuration

Create `frontend/.env.production`:

```env
VITE_API_URL=https://wellspring-backend.onrender.com
```

Update `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'maskable-icon-512x512.png'],
      manifest: {
        name: 'WellSpring - Wellbeing Community',
        short_name: 'WellSpring',
        description: 'Join wellbeing groups and connect with your community',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.onrender\.com\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

#### Step 2: Create Netlify Account & Deploy

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose GitHub and select your repository
5. Configure build settings:
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```

#### Step 3: Add Environment Variables

In Netlify: Site settings → Environment variables

```bash
VITE_API_URL=https://wellspring-backend.onrender.com
```

#### Step 4: Deploy!

Click **"Deploy site"**

Your PWA will be live at: `https://your-app-name.netlify.app`

---

## 🧪 Post-Deployment Testing

### 1. Test Backend Health

```bash
curl https://wellspring-backend.onrender.com/api/v1/health
```

Should return: `{"status": "success", "message": "Server is healthy"}`

### 2. Test PWA Features

Visit your Netlify URL and:

1. **Open Chrome DevTools** → **Application** tab
2. Check:
   - ✅ Manifest loads
   - ✅ Service Worker registered
   - ✅ Icons display correctly
   - ✅ Install button appears

### 3. Run Lighthouse Audit

1. Open DevTools → **Lighthouse** tab
2. Select **Progressive Web App**
3. Click **Analyze page load**
4. **Target Score: 90+**

### 4. Test on Mobile

1. Open your Netlify URL on mobile
2. Look for **"Add to Home Screen"** prompt
3. Install and test offline functionality

---

## 📱 PWA-Specific Deployment Checklist

- [ ] HTTPS enabled (automatic on Netlify)
- [ ] manifest.webmanifest accessible
- [ ] Service Worker registers successfully
- [ ] Icons (64, 192, 512) present in `/public`
- [ ] Maskable icon for Android
- [ ] Apple touch icon for iOS
- [ ] `theme-color` meta tag in HTML
- [ ] Proper cache headers for SW
- [ ] Offline page works
- [ ] Install prompt appears
- [ ] App works after installation

---

## 🔄 Continuous Deployment

Both platforms support auto-deploy:

### Netlify

- Push to `main` → automatic deploy
- Pull requests get preview URLs
- Rollback available in dashboard

### Render

- Push to `main` → automatic deploy
- View logs in real-time
- Automatic health checks

---

## 🐛 Common Issues & Solutions

### Issue 1: Service Worker Not Updating

**Solution:** Update version in `vite.config.js`:

```javascript
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    cleanupOutdatedCaches: true,
    skipWaiting: true,
  },
});
```

### Issue 2: PWA Not Installable

Check:

1. HTTPS is enabled ✅
2. Valid manifest.json ✅
3. Service Worker registered ✅
4. Icons present (192, 512) ✅
5. start_url matches deployment URL ✅

### Issue 3: CORS Errors

Update backend CORS config:

```typescript
app.use(
  cors({
    origin: ['https://your-app.netlify.app', 'http://localhost:5174'],
    credentials: true,
  })
);
```

### Issue 4: API Calls Failing

1. Check `VITE_API_URL` in Netlify env vars
2. Verify backend is running on Render
3. Test API endpoint directly

---

## 🚀 Quick Deploy Commands

```bash
# Frontend (from project root)
cd frontend
npm run build
netlify deploy --prod

# Backend (if using Railway)
railway up

# Or use GitHub auto-deploy (recommended)
git add .
git commit -m "chore: prepare for deployment"
git push origin main
```

---

## 📊 Monitoring

### Render Dashboard

- View logs: Dashboard → Service → Logs
- Monitor metrics: CPU, Memory, Requests
- Set up alerts

### Netlify Analytics

- Bandwidth usage
- Form submissions
- Build minutes

---

## 💰 Cost Estimates

### Free Tier Limits

**Netlify:**

- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites

**Render:**

- 750 hours/month (1 service = 24/7)
- PostgreSQL: Free 90 days, then $7/month

### When You Need to Upgrade

- More than 100GB bandwidth → Netlify Pro ($19/month)
- Database persistence → Render Postgres ($7/month)
- Multiple services → Check usage

---

## 🎉 You're Ready to Deploy!

Follow the steps above, and your PWA will be live and installable on any device!

Need help? Check the logs or feel free to ask! 🚀
