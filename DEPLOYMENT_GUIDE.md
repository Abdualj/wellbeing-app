# 🚀 Deployment Guide - WellSpring App

## Frontend Deployment (Netlify)

### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub/GitLab
2. Make sure `package.json` has the correct build command
3. Verify `vite.config.js` has proxy configuration

### Step 2: Deploy to Netlify

#### Option A: Using Netlify UI

1. Go to [Netlify](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Configure build settings:
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```
5. Add environment variables:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
6. Click "Deploy site"

#### Option B: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from frontend directory
cd frontend
netlify deploy --prod
```

### Step 3: Configure netlify.toml

Create `netlify.toml` in the `frontend` directory:

```toml
[build]
  base = "frontend"
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
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## Backend Deployment (Render.com) ⭐ Recommended

### Why Render?

- ✅ Free tier with 750 hours/month
- ✅ PostgreSQL included (free 90 days, then $7/month)
- ✅ Auto-deploy from Git
- ✅ Easy environment variables
- ✅ HTTPS by default

### Step 1: Prepare Backend

1. Ensure `package.json` has start script:

   ```json
   {
     "scripts": {
       "start": "node dist/server.js",
       "build": "tsc"
     }
   }
   ```

2. Update PORT configuration in your backend:

   ```typescript
   const PORT = process.env.PORT || 3000;
   ```

3. Configure CORS for your Netlify domain:
   ```typescript
   app.use(
     cors({
       origin: ['https://your-app.netlify.app', 'http://localhost:5173'],
     })
   );
   ```

### Step 2: Deploy to Render

1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your repository
4. Configure:

   ```
   Name: wellbeing-backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

5. Add environment variables:
   ```
   DATABASE_URL=your-postgres-connection-string
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   FRONTEND_URL=https://your-app.netlify.app
   ```

### Step 3: Set Up PostgreSQL Database

1. In Render dashboard, click "New +" → "PostgreSQL"
2. Name it `wellbeing-db`
3. Copy the "Internal Database URL"
4. Add it to your web service as `DATABASE_URL`

### Step 4: Run Migrations

```bash
# SSH into Render or use their shell
npx prisma migrate deploy
npx prisma db seed
```

---

## Alternative: Railway.app

### Pros & Cons

- ✅ $5 free credit monthly
- ✅ PostgreSQL included
- ✅ No cold starts
- ⚠️ Credit-based (may need to upgrade)

### Quick Deploy

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repo
4. Railway auto-detects Node.js
5. Add PostgreSQL from marketplace
6. Environment variables are auto-set
7. Deploy!

---

## Environment Variables Setup

### Frontend (.env)

```env
VITE_API_URL=https://your-backend.onrender.com
```

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NODE_ENV=production
FRONTEND_URL=https://your-app.netlify.app
PORT=3000
```

---

## Post-Deployment Checklist

### Frontend

- [ ] App loads correctly
- [ ] PWA manifest is accessible (`/manifest.webmanifest`)
- [ ] Service worker registers
- [ ] Install prompt appears
- [ ] Icons display correctly
- [ ] Environment variables are set
- [ ] API calls work

### Backend

- [ ] Health check endpoint works (`/health`)
- [ ] Database connection successful
- [ ] CORS configured correctly
- [ ] All API routes accessible
- [ ] Authentication works
- [ ] File uploads work

### PWA Specific

- [ ] App is installable
- [ ] Offline mode works
- [ ] Service worker updates properly
- [ ] Lighthouse PWA score > 90
- [ ] Meta tags are correct
- [ ] Icons show on install

---

## Testing Your Deployment

### 1. Test API Connection

```bash
curl https://your-backend.onrender.com/health
```

### 2. Test Frontend

Open: `https://your-app.netlify.app`

### 3. Test PWA Features

1. Open Chrome DevTools
2. Go to Application tab
3. Check:
   - Manifest
   - Service Workers
   - Cache Storage
   - Offline mode

### 4. Run Lighthouse Audit

1. Open DevTools
2. Lighthouse tab
3. Select "Progressive Web App"
4. Click "Analyze page load"
5. Aim for score > 90

---

## Continuous Deployment

Both Netlify and Render support auto-deploy:

1. Push to `main` branch
2. Automatic build triggers
3. Tests run (if configured)
4. Deploy to production

### Branch Previews (Netlify)

- Every PR gets a preview URL
- Test before merging
- Automatic cleanup after merge

---

## Monitoring & Logs

### Netlify

- Dashboard → Your Site → Logs
- Real-time build logs
- Function logs (if using)

### Render

- Dashboard → Your Service → Logs
- Live tail logs
- Error tracking

---

## Database Backup (Important!)

### Render PostgreSQL

```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore backup
psql $DATABASE_URL < backup.sql
```

### Automated Backups

- Render: Automatic daily backups (paid plans)
- Railway: Automatic backups included

---

## Cost Estimate (Free Tier)

| Service     | Free Tier          | Limitations                       |
| ----------- | ------------------ | --------------------------------- |
| **Netlify** | ✅ Free forever    | 100GB bandwidth/month             |
| **Render**  | ✅ 750 hours/month | Spins down after 15min inactivity |
| **Railway** | ✅ $5 credit/month | ~300 hours runtime                |
| **Vercel**  | ✅ Free forever    | 100GB bandwidth/month             |

**Recommended Stack (100% Free):**

- Frontend: Netlify
- Backend: Render.com
- Database: Render PostgreSQL (free 90 days)

---

## Troubleshooting

### Build Fails on Netlify

```bash
# Check Node version
# Add .nvmrc file:
echo "18" > .nvmrc

# Or set in Netlify UI:
# Site settings → Build & deploy → Environment → NODE_VERSION=18
```

### Backend Not Starting on Render

- Check logs for errors
- Verify start command: `npm start`
- Ensure PORT is from environment: `process.env.PORT`
- Check database connection string

### CORS Errors

```typescript
// backend/src/app.ts
app.use(
  cors({
    origin: ['https://your-app.netlify.app', 'http://localhost:5173'],
    credentials: true,
  })
);
```

### PWA Not Installing

- Ensure HTTPS is enabled (automatic on Netlify)
- Check manifest.webmanifest is accessible
- Verify service worker registers
- Check console for errors

---

## 🎉 Your App is Live!

After deployment:

1. Update README with live URLs
2. Test all features thoroughly
3. Share with users
4. Monitor logs for errors
5. Set up analytics (optional)

**Frontend URL:** `https://your-app.netlify.app`
**Backend URL:** `https://your-backend.onrender.com`

---

## Next Steps

1. Set up custom domain (optional)
2. Configure analytics (Google Analytics, Plausible)
3. Set up error tracking (Sentry)
4. Enable performance monitoring
5. Add SSL certificate (automatic on Netlify)
6. Set up status page (status.your-app.com)

Good luck with your deployment! 🚀
