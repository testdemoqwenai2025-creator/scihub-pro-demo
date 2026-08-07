# 🚀 SciHub Pro - GitHub Deployment Guide

## Quick Start (3 Options)

### Option 1: Vercel (Easiest - Recommended for Next.js)

**Time: ~2 minutes | No coding required**

1. **Go to [Vercel](https://vercel.com)**
   - Sign up/login with your GitHub account

2. **Import Repository**
   - Click "Add New Project" → "Import Git Repository"
   - Select `scihub-pro-demo` (or your repo name)

3. **Configure (Auto-detected)**
   - Framework Preset: **Next.js** ✅
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)
   - Click **Deploy**

4. **Get Your Live URL**
   - Vercel gives you: `https://scihub-pro-xxx.vercel.app`
   - Custom domain available in Settings

---

### Option 2: GitHub + Manual Push

**If you want to push from your terminal:**

```bash
# 1. Navigate to project
cd /home/z/my-project

# 2. Create GitHub repo first at: https://github.com/new
#    Repo name: scihub-pro-demo
#    Set to Public

# 3. Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/scihub-pro-demo.git

# 4. Push to GitHub
git push -u origin main

# 5. Go to Vercel/Netlify and import the repo
```

**Using Personal Access Token (if 2FA enabled):**
```bash
# 1. Create token: https://github.com/settings/tokens → Generate new token
# 2. Select 'repo' scope
# 3. Use token as password:
git remote add origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/scihub-pro-demo.git
git push -u origin main
```

---

### Option 3: Netlify

1. Go to [Netlify](https://app.netlify.com/start)
2. Connect GitHub repository
3. Settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Click **Deploy Site**

---

## What Gets Deployed

Your SciHub Pro includes **11 fully-built pages**:

| Page | Route | Features |
|------|-------|----------|
| **Landing** | `/` | Hero, features, pricing tiers, CTA |
| **Dashboard** | `/dashboard` | Stats cards, activity feed, system health |
| **Data Lake** | `/data` | Dataset management, upload, grid/table views |
| **Connectors** | `/connectors` | 12 scientific APIs (CrossRef, NCBI, PubChem...) |
| **Query/Search** | `/query` | Literature search with filters & export |
| **Workspace** | `/workspace` | Code editor (Python/SQL/R/Markdown) |
| **Compute** | `/compute` | Job queue, GPU cluster monitoring |
| **AETHEL AI** | `/aethel` | AI assistant interface |
| **Knowledge Graph** | `/knowledge` | Visual knowledge exploration |
| **Collaboration** | `/collaboration` | Team sharing & permissions |
| **Settings** | `/settings` | Preferences, database config |

---

## Environment Variables (Optional)

For production deployments, set these in Vercel/Netlify:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

---

## Troubleshooting

### Build fails?
- Run `npm run build` locally first to test
- Check Node.js version (requires 18+)

### Styles not loading?
- Ensure Tailwind CSS is installed: `npm install tailwindcss postcss autoprefixer`

### API routes not working?
- Vercel supports Next.js API routes natively
- No extra configuration needed

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **GitHub Support**: https://support.github.com

---

**🎉 Once deployed, share your live URL and I can help you customize it further!**
