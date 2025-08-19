#!/bin/bash

echo "🚀 YN Young Network - Deployment Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Make sure you're in the project directory."
    exit 1
fi

echo "✅ Project files found"

# Commit any changes
echo "📝 Committing changes..."
git add .
git commit -m "Deploy to production" || echo "No changes to commit"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "🎉 Deployment Options:"
echo ""
echo "1. 🌐 Netlify (Easiest):"
echo "   - Go to https://netlify.com"
echo "   - Drag this folder to the deploy area"
echo "   - Get instant live URL"
echo ""
echo "2. 🚀 Vercel:"
echo "   - Run: npx vercel"
echo "   - Follow the prompts"
echo ""
echo "3. 📄 GitHub Pages:"
echo "   - Go to your GitHub repo"
echo "   - Settings > Pages"
echo "   - Select 'main' branch"
echo ""
echo "4. 🔧 Manual Upload:"
echo "   - Upload all files to any web hosting service"
echo "   - Make sure to include all .js, .css, and .html files"
echo ""

echo "📋 Before going live:"
echo "   - Update supabase-config.js with your credentials"
echo "   - Test real-time features locally"
echo "   - Share the URL with friends to test cross-device updates"
echo ""

echo "🌟 Your YN Young Network will be live and accessible to everyone!"
