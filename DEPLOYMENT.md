# Deployment Guide

This guide covers deploying the PRD Generator application to various platforms.

## Prerequisites

1. **Environment Variables**: Copy `.env.example` to `.env` and fill in all required values
2. **Database**: Set up a PostgreSQL database (recommended: Railway, Neon, or Supabase)
3. **Google Gemini API**: Get an API key from Google AI Studio
4. **Domain**: Optional, but recommended for production

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Setup**:
   ```bash
   npm install -g vercel
   ```

2. **Database Setup**:
   - Create a PostgreSQL database on Railway/Neon/Supabase
   - Run migrations: `npx prisma db push`
   - Seed data: `npm run db:seed`

3. **Environment Variables**:
   Add these to your Vercel project settings:
   ```
   DATABASE_URL=your_production_database_url
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   NEXTAUTH_SECRET=your_secure_random_string
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

### Option 2: Railway

1. **Connect Repository**: Link your GitHub repo to Railway
2. **Environment Variables**: Set the same variables as above
3. **Database**: Use Railway's PostgreSQL addon
4. **Deploy**: Push to main branch triggers automatic deployment

### Option 3: Docker

1. **Build Image**:
   ```bash
   docker build -t prd-generator .
   ```

2. **Run Container**:
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL=your_database_url \
     -e GOOGLE_GEMINI_API_KEY=your_api_key \
     -e NEXTAUTH_SECRET=your_secret \
     -e NEXTAUTH_URL=http://localhost:3000 \
     prd-generator
   ```

## Database Migration

For new deployments:
```bash
npx prisma db push
npm run db:seed
```

For updates:
```bash
npx prisma migrate deploy
```

## Health Checks

The application includes a health check endpoint at `/api/health`:
- Returns 200 OK when healthy
- Includes database connection status
- Useful for load balancers and monitoring

## Monitoring

### Error Logging
- Console errors are logged in production
- Consider integrating with Sentry for error tracking

### Performance Monitoring
- Use Vercel Analytics or similar
- Monitor API response times
- Track Gemini API usage and costs

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: Configured for idea analysis API
4. **CORS**: Properly configured for your domain
5. **Authentication**: NextAuth.js handles secure sessions

## Scaling

### Database
- Use connection pooling for high traffic
- Consider read replicas for read-heavy workloads
- Monitor query performance

### API Limits
- Monitor Gemini API quotas and costs
- Implement user usage tracking
- Consider caching for repeated requests

### CDN
- Use Vercel's CDN or Cloudflare
- Optimize images and static assets
- Enable compression

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check TypeScript errors
   - Verify all environment variables are set
   - Ensure database is accessible

2. **Database Connection**:
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure database exists

3. **Gemini API Errors**:
   - Verify API key is valid
   - Check quota limits
   - Monitor rate limiting

### Logs

Check application logs in your deployment platform:
- Vercel: Function logs in dashboard
- Railway: Application logs tab
- Docker: `docker logs container_name`

## Maintenance

### Regular Tasks
1. **Database Backups**: Set up automated backups
2. **Dependency Updates**: Keep packages updated
3. **Security Patches**: Monitor for vulnerabilities
4. **Performance Review**: Check metrics regularly

### Monitoring Alerts
Set up alerts for:
- High error rates
- Slow response times
- Database connection issues
- API quota approaching limits