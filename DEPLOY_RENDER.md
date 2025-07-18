# Deploy ShiftMaster to Render

This guide will walk you through deploying ShiftMaster to Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. Your Neon database is already set up
3. Your code is pushed to a GitHub repository

## Deployment Steps

### Step 1: Push Your Code to GitHub

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### Step 2: Create a New Web Service on Render

1. Go to your [Render Dashboard](https://dashboard.render.com)
2. Click "New +" and select "Web Service"
3. Connect your GitHub account if you haven't already
4. Select your ShiftMaster repository
5. Configure the service:
   - **Name**: shiftmaster (or your preferred name)
   - **Environment**: Node
   - **Region**: Choose the closest to your users
   - **Branch**: main
   - **Root Directory**: (leave blank)
   - **Build Command**: `./build.sh`
   - **Start Command**: `npm start`

### Step 3: Configure Environment Variables

In the Render dashboard for your service, go to the "Environment" tab and add these variables:

```bash
# Database (from Neon)
DATABASE_URL=postgresql://neondb_owner:password@host.neon.tech/neondb?sslmode=require

# NextAuth Configuration
NEXTAUTH_URL=https://your-app-name.onrender.com
NEXTAUTH_SECRET=your-generated-secret

# Google AI
GOOGLE_AI_API_KEY=your-google-ai-api-key

# GitHub OAuth (optional)
GITHUB_ID=your-github-oauth-id
GITHUB_SECRET=your-github-oauth-secret

# App URL
NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com
```

**Important Notes:**
- Replace `your-app-name` with your actual Render app name
- Make sure `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` use HTTPS and your Render URL
- Generate a new `NEXTAUTH_SECRET` for production: `openssl rand -base64 32`

### Step 4: Update GitHub OAuth (if using)

If you're using GitHub authentication:

1. Go to your GitHub OAuth App settings
2. Update the URLs:
   - **Homepage URL**: `https://your-app-name.onrender.com`
   - **Authorization callback URL**: `https://your-app-name.onrender.com/api/auth/callback/github`

### Step 5: Deploy

1. Click "Create Web Service" in Render
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Generate Prisma client
   - Push database schema
   - Build your Next.js app
   - Start the production server

### Step 6: Initialize Database (First Time Only)

After your first deployment, you may need to seed your database:

1. In Render dashboard, go to your service
2. Click on "Shell" tab
3. Run: `npm run db:seed`

This will create the initial admin user and sample data.

## Post-Deployment

### Monitor Your App

- Check the "Logs" tab in Render for any errors
- Visit your app at `https://your-app-name.onrender.com`

### Default Login

After seeding, you can login with:
- **Email**: kenn.teoh@storehub.com
- **Password**: ShiftMaster2024!

### Automatic Deployments

Render will automatically redeploy when you push to your main branch.

## Troubleshooting

### Database Connection Issues
- Ensure your DATABASE_URL is correct
- Check that your Neon database is active
- Verify SSL mode is set to `require`

### Build Failures
- Check the Render logs for specific errors
- Ensure all environment variables are set
- Try running `npm run build` locally to test

### Authentication Issues
- Verify NEXTAUTH_URL matches your Render URL
- Ensure NEXTAUTH_SECRET is set
- Check GitHub OAuth URLs if using GitHub login

## Performance Tips

1. Render's free tier may sleep after inactivity
2. Consider upgrading to a paid plan for:
   - Always-on service
   - More RAM and CPU
   - Custom domains
   - Auto-scaling

## Custom Domain (Optional)

1. In Render dashboard, go to Settings
2. Add your custom domain
3. Update DNS records as instructed
4. Update all environment variables with new domain