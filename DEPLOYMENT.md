# Deployment Guide

This guide provides instructions for deploying the Ping Pong Game to various hosting platforms.

## Quick Deploy Options

### 1. GitHub Pages (Free)

GitHub Pages is perfect for static websites like this project.

**Steps:**

1. Push your code to a GitHub repository:
```bash
git remote add origin https://github.com/yourusername/ping-pong-game.git
git branch -M main
git push -u origin main
```

2. Enable GitHub Pages:
   - Go to repository Settings
   - Navigate to "Pages" section
   - Set source to "main" branch
   - Choose root folder "/"
   - Save

3. Access your site at:
   `https://yourusername.github.io/ping-pong-game/pages/login.html`

**Note**: Update all navigation links to include the repository name:
```javascript
// In constants.js
export const ROUTES = {
    LOGIN: '/ping-pong-game/pages/login.html',
    REGISTER: '/ping-pong-game/pages/register.html',
    // ... etc
};
```

### 2. Netlify (Free)

Netlify offers continuous deployment and automatic HTTPS.

**Steps:**

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
cd /path/to/frontend
netlify deploy
```

3. For production:
```bash
netlify deploy --prod
```

**Using Netlify UI:**
1. Go to https://app.netlify.com
2. Drag and drop the `frontend` folder
3. Done! Your site is live

**Configuration (`netlify.toml`):**
```toml
[build]
  publish = "."
  
[[redirects]]
  from = "/*"
  to = "/pages/login.html"
  status = 200
```

### 3. Vercel (Free)

Vercel provides instant global deployment with excellent performance.

**Steps:**

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd /path/to/frontend
vercel
```

3. For production:
```bash
vercel --prod
```

**Configuration (`vercel.json`):**
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "routes": [
    {
      "src": "/",
      "dest": "/pages/login.html"
    }
  ]
}
```

### 4. Firebase Hosting (Free)

Firebase offers fast, secure hosting with CDN.

**Steps:**

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login:
```bash
firebase login
```

3. Initialize:
```bash
firebase init hosting
```

4. Configure:
   - Public directory: `.`
   - Single-page app: No
   - Set up redirects: No

5. Deploy:
```bash
firebase deploy --only hosting
```

**Configuration (`firebase.json`):**
```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/",
        "destination": "/pages/login.html"
      }
    ]
  }
}
```

### 5. Surge (Free)

Simple, single-command deployment for static sites.

**Steps:**

1. Install Surge:
```bash
npm install -g surge
```

2. Deploy:
```bash
cd /path/to/frontend
surge
```

3. Follow prompts to choose domain

### 6. Render (Free)

**Steps:**

1. Go to https://render.com
2. Click "New +" → "Static Site"
3. Connect your Git repository
4. Configure:
   - Build Command: (leave empty)
   - Publish Directory: `.`
5. Click "Create Static Site"

## Custom Domain Setup

### GitHub Pages
1. Add `CNAME` file to root with your domain
2. Configure DNS with your domain provider:
   - Type: A
   - Name: @
   - Value: GitHub Pages IPs

### Netlify
1. Go to Domain Settings
2. Add custom domain
3. Follow DNS configuration instructions

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS as instructed

## Environment-Specific Configurations

### Production Optimizations

1. **Minify CSS/JS** (optional, for performance):
```bash
npm install -g minify
minify styles/main.css > styles/main.min.css
```

2. **Enable Compression** (configure in hosting platform):
   - Enable Brotli/Gzip compression
   - Set cache headers

3. **Set Security Headers**:
```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```

## Testing Deployment Locally

Before deploying, test with a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Using npm script
npm run dev
```

Navigate to `http://localhost:8000/pages/login.html`

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

## Monitoring & Analytics

### Add Google Analytics

Add to `<head>` of all HTML files:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Troubleshooting

### Issue: Pages not loading
- Check file paths are correct
- Ensure case sensitivity in URLs
- Verify all files are uploaded

### Issue: JavaScript not working
- Check browser console for errors
- Ensure CORS is configured properly
- Verify module imports are correct

### Issue: Styles not applying
- Clear browser cache
- Check CSS file path
- Verify media queries for responsive design

## Post-Deployment Checklist

- [ ] All pages load correctly
- [ ] Navigation works between pages
- [ ] Forms validate and submit
- [ ] Game functions properly
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Custom domain configured (if applicable)
- [ ] Analytics tracking (if desired)
- [ ] Performance tested (Lighthouse score)
- [ ] Accessibility verified

## Performance Tips

1. Enable CDN caching
2. Compress images (if added later)
3. Use lazy loading for images
4. Enable HTTP/2
5. Set appropriate cache headers

## Support

For deployment issues:
1. Check hosting platform documentation
2. Review browser console for errors
3. Test locally first
4. Verify all file paths are correct

---

**Recommended**: Start with Netlify or Vercel for easiest deployment with automatic HTTPS and global CDN.
