# EduNexa LMS - Render Deployment Guide

## Prerequisites
- GitHub account
- Render account (free tier available)
- MongoDB Atlas account (free tier available)

## Step 1: MongoDB Atlas Setup (5 minutes)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free M0 cluster
3. Database Access → Add user with read/write permissions
4. Network Access → Allow access from anywhere (0.0.0.0/0)
5. Get connection string: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/edunexa_lms`

## Step 2: Push Code to GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Step 3: Deploy Backend on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: edunexa-backend
   - **Region**: Choose closest to you
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -c gunicorn_config.py app:app`
   - **Instance Type**: Free

5. Add Environment Variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET_KEY`: Generate a random string (use: https://randomkeygen.com/)
   - `GEMINI_API_KEY`: Your Google Gemini API key (optional)
   - `FLASK_ENV`: production
   - `PYTHON_VERSION`: 3.11.0

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL: `https://edunexa-backend.onrender.com`

## Step 4: Deploy Frontend on Render

1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   - **Name**: edunexa-frontend
   - **Branch**: main
   - **Root Directory**: (leave empty)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: dist

4. Add Environment Variable:
   - `VITE_API_BASE_URL`: Your backend URL + /api (e.g., `https://edunexa-backend.onrender.com/api`)

5. Click "Create Static Site"
6. Wait for deployment (3-5 minutes)

## Step 5: Update Backend CORS

After frontend deployment, update backend CORS settings:

1. Go to backend service on Render
2. Add environment variable:
   - `FRONTEND_URL`: Your frontend URL (e.g., `https://edunexa-frontend.onrender.com`)

3. The backend will need to be updated to use this variable in CORS configuration

## Step 6: Test Your Deployment

1. Visit your frontend URL
2. Try to register/login
3. Test creating courses, assignments, etc.

## Important Notes

### Free Tier Limitations
- Backend spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free (enough for one service)

### Upgrade Options
- Paid plans start at $7/month for always-on services
- Better performance and no spin-down delays

### Database Backups
- MongoDB Atlas free tier includes automated backups
- Export data regularly for safety

### Monitoring
- Check Render logs for errors
- Monitor MongoDB Atlas for connection issues

## Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check Render logs for specific errors

### Frontend can't connect to backend
- Verify VITE_API_BASE_URL is correct
- Check backend CORS settings
- Ensure backend is running (check Render dashboard)

### Database connection fails
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check username/password in connection string
- Ensure database user has correct permissions

## Cost Estimate

**Free Tier (Recommended for testing):**
- MongoDB Atlas: Free (M0 cluster)
- Render Backend: Free (with spin-down)
- Render Frontend: Free
- **Total: $0/month**

**Production Tier:**
- MongoDB Atlas: Free or $9/month (M2 cluster)
- Render Backend: $7/month (always-on)
- Render Frontend: Free
- **Total: $7-16/month**

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates (automatic on Render)
3. Set up monitoring and alerts
4. Configure automated backups
5. Add CI/CD pipeline for automatic deployments
