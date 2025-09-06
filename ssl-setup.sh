#!/bin/bash
set -e

echo "🔒 Setting up SSL certificates for edrishusein.com..."

# Install Certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Stop Nginx temporarily (if running)
sudo systemctl stop nginx 2>/dev/null || true

# Get SSL certificate
echo "📜 Obtaining SSL certificate..."
sudo certbot certonly --standalone \
    -d edrishusein.com \
    -d www.edrishusein.com \
    --email your-email@example.com \
    --agree-tos \
    --non-interactive

# Copy nginx configuration
echo "⚙️ Setting up Nginx configuration..."
sudo cp nginx.conf /etc/nginx/sites-available/edrishusein.com

# Enable the site
sudo ln -sf /etc/nginx/sites-available/edrishusein.com /etc/nginx/sites-enabled/

# Remove default nginx site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Start/restart nginx
echo "🚀 Starting Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Set up auto-renewal
echo "🔄 Setting up auto-renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
echo "🧪 Testing certificate renewal..."
sudo certbot renew --dry-run

echo "✅ SSL setup complete!"
echo "🌐 Your site should now be accessible at:"
echo "   https://edrishusein.com"
echo "   https://www.edrishusein.com"
echo ""
echo "🔍 To check certificate status:"
echo "   sudo certbot certificates"
echo ""
echo "📝 Certificate will auto-renew every 90 days"