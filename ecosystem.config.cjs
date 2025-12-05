/**
 * PM2 Ecosystem Configuration
 *
 * Production configuration for Probador Virtual frontend
 * Uses Vite dev server for production (same as npm run dev)
 */

module.exports = {
  apps: [
    {
      name: 'probador-virtual',
      script: 'npm',
      args: 'run dev',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
