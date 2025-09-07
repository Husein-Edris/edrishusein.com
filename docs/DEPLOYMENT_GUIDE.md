# Deployment Guide: Next.js to IONOS VPS

## 1. DNS Records for Hostinger

### Current Setup
- `cms.edrishusein.com` → Hostinger (WordPress)
- Other subdomains → Hostinger

### DNS Records to Add/Modify in Hostinger DNS Zone

```dns
# Main domain to IONOS VPS
Type: A
Name: @ (or edrishusein.com)
Value: [YOUR_IONOS_VPS_IP]
TTL: 300

# WWW redirect to main domain
Type: CNAME  
Name: www
Value: edrishusein.com
TTL: 300

# Keep existing (DO NOT CHANGE)
Type: A/CNAME
Name: cms
Value: [EXISTING_HOSTINGER_VALUE]

Type: A/CNAME
Name: [other_subdomains]
Value: [EXISTING_HOSTINGER_VALUES]
```

## 2. Production Environment Variables

Create `.env.production` on IONOS VPS:

```env
NEXT_PUBLIC_WORDPRESS_API_URL=https://cms.edrishusein.com/graphql
NEXT_PUBLIC_SITE_URL=https://edrishusein.com
NODE_ENV=production
```

## 3. WordPress CORS Configuration

Update your WordPress `headless-wp-theme` functions.php to include:

```php
// Allow CORS from production domain
add_action('init', function() {
    $allowed_origins = [
        'https://edrishusein.com',
        'https://www.edrishusein.com',
        'http://localhost:3000', // Keep for local dev
        'http://localhost:3001'  // Keep for local dev
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Headers: Authorization, X-WP-Nonce, Content-Disposition, Content-MD5, Content-Type");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    }
});
```

## 4. Deployment Commands for IONOS VPS

### Prerequisites on VPS
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt update && sudo apt install -y nginx
```

### Deployment Steps
```bash
# 1. Upload your project to VPS (via SCP, git, etc.)
scp -r /path/to/your/project root@YOUR_VPS_IP:/var/www/edrishusein.com

# 2. Navigate to project directory
cd /var/www/edrishusein.com

# 3. Install dependencies
npm ci --only=production

# 4. Build the application
npm run build

# 5. Start with PM2
pm2 start npm --name "edrishusein.com" -- start
pm2 save
pm2 startup
```

## 5. Nginx Configuration

Create `/etc/nginx/sites-available/edrishusein.com`:

```nginx
server {
    listen 80;
    server_name edrishusein.com www.edrishusein.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name edrishusein.com www.edrishusein.com;

    # SSL Configuration (will be added after certificate generation)
    ssl_certificate /etc/letsencrypt/live/edrishusein.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/edrishusein.com/privkey.pem;
    
    # Security headers (Next.js already provides these, but good to have at nginx level too)
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Handle Next.js static assets
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/edrishusein.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 6. SSL Certificate Setup

### For Main Domain (on IONOS VPS)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d edrishusein.com -d www.edrishusein.com

# Test renewal
sudo certbot renew --dry-run
```

### For CMS Domain (on Hostinger)
- Hostinger should already have SSL for `cms.edrishusein.com`
- If not, enable it in Hostinger control panel

## 7. Deployment Script

Create `deploy.sh` for easy updates:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying edrishusein.com..."

# Pull latest code (if using git)
git pull origin main

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Restart PM2 process
pm2 restart edrishusein.com

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

## 8. Health Check

After deployment, verify:

```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check application logs
pm2 logs edrishusein.com

# Test endpoints
curl https://edrishusein.com
curl https://edrishusein.com/api/about
```

## 9. Monitoring Setup

```bash
# Monitor with PM2
pm2 monit

# Set up log rotation
pm2 install pm2-logrotate
```

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Check WordPress CORS configuration
2. **Image Loading Issues**: Verify Next.js image domains in `next.config.ts`
3. **API Timeouts**: Check API routes and WordPress connectivity
4. **SSL Issues**: Verify certificate paths in Nginx config

### Debug Commands:
```bash
# Check application logs
pm2 logs edrishusein.com --lines 100

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test WordPress API
curl https://cms.edrishusein.com/graphql
```