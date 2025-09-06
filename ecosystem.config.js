module.exports = {
  apps: [{
    name: 'edrishusein.com',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/edrishusein.com',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_WORDPRESS_API_URL: 'https://cms.edrishusein.com/graphql',
      NEXT_PUBLIC_SITE_URL: 'https://edrishusein.com'
    },
    error_file: '/var/log/pm2/edrishusein.com-error.log',
    out_file: '/var/log/pm2/edrishusein.com-out.log',
    log_file: '/var/log/pm2/edrishusein.com-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};