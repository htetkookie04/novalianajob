# Job Portal Backend - Deployment Guide

## 🚀 Deploying to Render

This Spring Boot application is configured to deploy to Render using Docker.

### Prerequisites
- GitHub/GitLab/Bitbucket account
- Render account ([render.com](https://render.com))
- Your code pushed to a repository

### Quick Deploy Steps

#### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add Docker and Render configuration"
   git push
   ```

2. **Connect to Render:**
   - Go to [render.com](https://render.com) and sign in
   - Click "New" → "Blueprint"
   - Connect your repository
   - Render will automatically detect `render.yaml`

3. **Update Environment Variables in Render Dashboard:**
   - Go to your service → "Environment"
   - Update these variables:
     - `SPRING_MAIL_USERNAME`: Your Gmail address
     - `SPRING_MAIL_PASSWORD`: Your Gmail App Password
     - `CORS_ALLOWED_ORIGINS`: Update with your actual Netlify URL

#### Option 2: Manual Deploy

1. **Create a Web Service:**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your repository

2. **Configure the service:**
   - **Name:** job-portal-backend
   - **Environment:** Docker
   - **Region:** Choose your preferred region
   - **Branch:** main
   - **Dockerfile Path:** backend/Dockerfile
   - **Docker Context:** backend

3. **Set Environment Variables:**
   ```
   PORT=8080
   SPRING_PROFILES_ACTIVE=production
   SPRING_DATASOURCE_URL=<your-database-url>
   JWT_SECRET=<generate-a-strong-random-secret>
   JWT_EXPIRATION=86400000
   CORS_ALLOWED_ORIGINS=https://novalianajob.netlify.app
   SPRING_MAIL_HOST=smtp.gmail.com
   SPRING_MAIL_PORT=587
   SPRING_MAIL_USERNAME=<your-email>
   SPRING_MAIL_PASSWORD=<your-app-password>
   SPRING_JPA_HIBERNATE_DDL_AUTO=update
   ```

4. **Deploy!** Render will build and deploy your application.

### 📝 Important Notes

#### Database Configuration
- You're currently using TiDB Cloud (MySQL)
- Make sure your database accepts connections from Render's IP addresses
- For production, consider using `ddl-auto=update` instead of `create`

#### Email Configuration (Gmail)
1. Enable 2-Step Verification in your Google Account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password (not your regular password) in `SPRING_MAIL_PASSWORD`

#### CORS Configuration
- Update `CORS_ALLOWED_ORIGINS` with your Netlify URL
- Format: `https://your-app.netlify.app` (no trailing slash)
- For multiple origins, separate with commas: `http://localhost:3000,https://your-app.netlify.app`

#### JWT Secret
- Generate a strong random secret (at least 32 characters)
- Never use the default secret in production
- You can generate one with: `openssl rand -base64 32`

### 🔗 After Deployment

1. **Get your Render URL:**
   - It will be something like: `https://job-portal-backend.onrender.com`

2. **Update your Netlify frontend:**
   - Go to Netlify → Site settings → Environment variables
   - Update `REACT_APP_API_URL` to: `https://your-render-url.onrender.com/api`
   - Trigger a new deploy in Netlify

3. **Test your deployment:**
   - Try accessing: `https://your-render-url.onrender.com/api/jobs`
   - Test login/register from your Netlify frontend

### 🐛 Troubleshooting

#### Build Failures
- Check Render logs for build errors
- Ensure all dependencies are in `pom.xml`
- Verify Java version matches (17)

#### Runtime Errors
- Check application logs in Render dashboard
- Verify all environment variables are set correctly
- Check database connection

#### CORS Errors
- Verify `CORS_ALLOWED_ORIGINS` includes your Netlify URL
- Check that the URL has no trailing slash
- Ensure the protocol matches (https)

#### Free Tier Limitations
- Render free tier spins down after inactivity
- First request after spin-down may take 30-50 seconds
- Consider upgrading to Starter plan for always-on service

### 📊 Local Development

For local development, use the default profile:
```bash
mvn spring-boot:run
```

To test production configuration locally:
```bash
SPRING_PROFILES_ACTIVE=production mvn spring-boot:run
```

### 🔒 Security Best Practices

1. **Never commit sensitive data:**
   - Use environment variables for secrets
   - Keep `.env` files in `.gitignore`

2. **Use strong JWT secrets:**
   - Minimum 32 characters
   - Random and unique per environment

3. **Database Security:**
   - Use SSL connections
   - Rotate credentials regularly
   - Limit database access to specific IPs if possible

4. **Update dependencies regularly:**
   - Check for security updates
   - Run `mvn versions:display-dependency-updates`

### 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [Spring Boot Production Best Practices](https://docs.spring.io/spring-boot/docs/current/reference/html/deployment.html)

