# Pre-Deployment Checklist for Hostinger Hosting

## 🚨 Critical Issues Found (Must Fix Before Deploy)

### ❌ Build Process Issues
- **API Timeouts**: About page build timing out (60s+)
- **Invalid URL Errors**: Relative URLs `/api/about` failing during build
- **GraphQL Query Failures**: "techs" field doesn't exist in WordPress schema

### ❌ Code Quality Issues  
- **29 ESLint errors** (temporarily bypassed)
- **TypeScript any types** throughout codebase
- **Unused variables** in multiple files

## ✅ What's Working Well

### Security ✅
- **Next.js 15.5.2** (latest, no vulnerabilities)
- **Strong security headers** configured
- **Input validation** added to API routes
- **No exposed secrets** in codebase

### Performance ✅
- **Image optimization** configured
- **Static generation** implemented
- **Caching strategies** in place
- **Bundle optimization** applied

## 🔧 Immediate Fixes Required

### 1. Fix API URL Issues (Critical)
```typescript
// app/about/page.tsx - Fix relative URL calls
const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/about`);
// Instead of: fetch('/api/about')
```

### 2. Fix GraphQL Schema Issues
```typescript
// Update tech stack query - "techs" field doesn't exist
const GET_TECH_STACK = `
  query GetTechStack {
    posts(where: { categoryName: "tech" }) {  // Use existing post type
      nodes { /* ... */ }
    }
  }
`;
```

### 3. Add Production Environment Variables
```bash
# .env.production
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_WORDPRESS_API_URL=https://cms.edrishusein.com/graphql
```

## 📋 Hostinger-Specific Setup

### VPS Requirements
- **Plan**: VPS (minimum 2GB RAM)
- **OS**: Ubuntu 22.04 LTS with Node.js
- **Node.js**: Version 18+ required
- **RAM**: 2GB minimum for build process
- **Storage**: 20GB minimum

### Server Setup Commands
```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install PM2
npm install -g pm2

# 3. Clone repository
git clone https://github.com/yourusername/edrishusein.com.git
cd edrishusein.com

# 4. Install dependencies
npm ci --production

# 5. Build application
npm run build

# 6. Start with PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### Required Files for Hostinger

#### ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'edrishusein-com',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

#### .htaccess (if using subdirectory)
```apache
RewriteEngine on
RewriteCond %{REQUEST_URI} !^/public/
RewriteRule ^(.*)$ /public/$1 [L]
```

## 🚀 Deployment Options

### Option 1: Full SSR (Recommended)
**Pros**: Dynamic content, real-time updates
**Cons**: Requires VPS, more complex setup
**Cost**: ~$3.99/month (VPS)

### Option 2: Static Export
**Pros**: Can use shared hosting, faster loading
**Cons**: No dynamic content, requires rebuild for updates
**Cost**: ~$0.99/month (shared hosting)

**For Static Export, add to next.config.ts:**
```typescript
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  // ... rest of config
};
```

## 📊 Performance Expectations on Hostinger

### VPS Performance Estimates:
- **Homepage Load**: 1.2-2.0s (first visit)
- **Project Pages**: 0.5-1.0s (cached)
- **API Response**: 200-500ms
- **Build Time**: 3-5 minutes

### Shared Hosting (Static) Performance:
- **Homepage Load**: 0.8-1.2s
- **Project Pages**: 0.3-0.8s  
- **No API calls** (static content only)

## 🔐 Security Configuration for Production

### 1. Environment Security
```bash
# Set secure file permissions
chmod 600 .env.production
chmod 755 public/
```

### 2. Nginx Security (VPS)
```nginx
# Add to server block
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Hide server version
server_tokens off;
```

### 3. Firewall Configuration
```bash
# UFW firewall setup
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 📋 Pre-Go-Live Checklist

### Code Preparation ⚠️
- [ ] Fix API timeout issues (build failing)
- [ ] Resolve GraphQL schema mismatches
- [ ] Fix relative URL calls in server components
- [ ] Add proper error boundaries
- [ ] Remove development console logs

### Hostinger Setup 🔄
- [ ] Purchase VPS plan
- [ ] Configure domain DNS
- [ ] Set up SSH access
- [ ] Install required software (Node.js, PM2, Git)
- [ ] Configure firewall

### Deployment Testing 🔄
- [ ] Test build process on server
- [ ] Verify all pages load correctly
- [ ] Test WordPress API connectivity
- [ ] Verify SSL certificate installation
- [ ] Test performance benchmarks

### Monitoring Setup 🔄
- [ ] Set up PM2 monitoring
- [ ] Configure log rotation
- [ ] Set up uptime monitoring
- [ ] Test backup procedures

## 🚨 Current Blockers

**Severity: HIGH**
1. **Build timeouts** during static generation
2. **API URL resolution** failing in server context
3. **GraphQL schema mismatches** causing query failures

**Recommended Actions:**
1. **Immediate**: Fix API URL resolution with absolute URLs
2. **Short-term**: Switch to static export for faster deployment
3. **Long-term**: Resolve GraphQL schema issues with WordPress admin

## 📞 Hostinger-Specific Support

**Key Contacts:**
- Hostinger VPS Support: Live chat available 24/7
- Knowledge Base: https://support.hostinger.com/en/collections/2267966-vps
- Community Forum: For Node.js specific questions

**Common Hostinger VPS Issues:**
- Port 3000 may need firewall configuration
- PM2 requires proper user permissions
- Node.js version management with NVM

---

**Status**: ⚠️ **NOT READY FOR DEPLOYMENT**  
**Primary Blocker**: Build process timeouts and API resolution issues  
**Estimated Fix Time**: 2-4 hours  
**Next Step**: Resolve API URL issues and test build again