#!/bin/bash

echo "🚀 Starting NFC ID System Deployment..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Build frontend
echo "🏗️ Building frontend..."
npm run build

# 3. Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Your app should be live at your Vercel URL"
