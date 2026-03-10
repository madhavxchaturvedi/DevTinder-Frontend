# DevTinder Frontend - Vercel Deployment

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your repository
5. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

## Environment Variables

Add the following environment variable in Vercel:

- **VITE_API_BASE_URL**: Your backend URL from Render (e.g., `https://your-app.onrender.com`)

### Steps to add environment variables:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add `VITE_API_BASE_URL` with your Render backend URL
4. Save and redeploy

## Important Notes

- The `vercel.json` file is configured to handle client-side routing
- All routes will fallback to `index.html` for proper SPA behavior
- Environment variables must be prefixed with `VITE_` to be accessible in the app
