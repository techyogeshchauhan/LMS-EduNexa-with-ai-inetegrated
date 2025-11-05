# EduNexa LMS - Netlify Deployment Guide

## Step 1: Netlify Build Settings

### Site Settings में जाकर ये configure करें:

**Build & Deploy Settings:**
- Branch to deploy: `main`
- Base directory: (leave empty)
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: (leave empty)

## Step 2: Environment Variables

Netlify Dashboard → Site Settings → Environment Variables में add करें:

```
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
VITE_APP_NAME=EduNexa LMS
VITE_APP_VERSION=1.0.0
```

## Step 3: Backend Deployment (पहले backend deploy करना होगा)

### Option 1: Render.com पर backend deploy करें
1. Render.com पर account बनाएं
2. New Web Service create करें
3. GitHub repo connect करें
4. Root directory: `backend`
5. Build command: `pip install -r requirements.txt`
6. Start command: `python app.py`

### Option 2: Railway पर backend deploy करें
1. Railway.app पर account बनाएं
2. New Project → Deploy from GitHub
3. Root directory: `backend`
4. Railway automatically detect करेगा

## Step 4: Frontend Deployment

1. GitHub पर code push करें
2. Netlify में New Site → Import from Git
3. Repository select करें
4. Build settings confirm करें
5. Deploy करें

## Step 5: Domain Setup (Optional)

- Custom domain add कर सकते हैं
- SSL automatically enable हो जाएगा

## Troubleshooting

### Common Issues:
1. Build fails → Check environment variables
2. API calls fail → Check VITE_API_BASE_URL
3. 404 on refresh → netlify.toml file already configured

### Build Commands:
- Development: `npm run dev`
- Production build: `npm run build`
- Preview: `npm run preview`