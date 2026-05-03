#!/bin/bash

echo "🚀 Quick Deploy to Netlify & Render"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root"
    exit 1
fi

echo "📦 Step 1: Install Netlify CLI (if needed)"
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
else
    echo "✓ Netlify CLI already installed"
fi

echo ""
echo "🔑 Step 2: Login to Netlify"
netlify login

echo ""
echo "🏗️  Step 3: Build Frontend"
cd frontend
npm run build

echo ""
echo "🚀 Step 4: Deploy to Netlify"
echo "Choose 'Create & configure a new site' when prompted"
echo ""
netlify deploy --prod

echo ""
echo "======================================"
echo "✅ Frontend Deployed!"
echo "======================================"
echo ""
echo "📝 Next Steps for Backend Deployment:"
echo ""
echo "1. Go to https://render.com and sign up/login"
echo ""
echo "2. Click 'New +' → 'Web Service'"
echo ""
echo "3. Connect your GitHub repository"
echo ""
echo "4. Configure with these settings:"
echo "   Name: wellspring-backend"
echo "   Branch: main"
echo "   Build Command: npm install && npm run build"
echo "   Start Command: npm start"
echo ""
echo "5. Create PostgreSQL Database:"
echo "   Click 'New +' → 'PostgreSQL'"
echo "   Name: wellspring-db"
echo "   Copy the 'Internal Database URL'"
echo ""
echo "6. Add Environment Variables to your Web Service:"
echo "   DATABASE_URL=<paste-internal-database-url>"
echo "   JWT_SECRET=$(openssl rand -base64 32)"
echo "   JWT_REFRESH_SECRET=$(openssl rand -base64 32)"
echo "   NODE_ENV=production"
echo "   FRONTEND_URL=https://<your-netlify-url>"
echo ""
echo "7. After backend deploys, run migrations in Render Shell:"
echo "   npx prisma migrate deploy"
echo "   npx prisma db seed"
echo ""
echo "8. Update frontend/.env.production with your backend URL"
echo "   Then redeploy frontend: netlify deploy --prod"
echo ""
echo "📚 See DEPLOY.md for detailed instructions"
echo ""
