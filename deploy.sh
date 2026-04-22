#!/bin/bash
echo "🛝 PlayQuote – Vercel Deploy"
echo "=============================="

# Install Vercel CLI if needed
if ! command -v vercel &> /dev/null; then
  echo "📦 Installiere Vercel CLI..."
  npm install -g vercel
fi

# Deploy to production
echo "🚀 Deploying to Vercel..."
vercel deploy --prod --yes

echo ""
echo "✅ Fertig! Ihre App ist live."
