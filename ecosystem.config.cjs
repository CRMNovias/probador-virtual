/**
 * PM2 en el servidor del probador (el mismo que la V1). La V2 es una app de
 * Node (Next) que nginx sirve en probador.crmnovias.com/v2: ver docs/deploy.md.
 * Las variables (CRM, Gemini, /v2) van en .env.local, fuera del repo.
 */
module.exports = {
  apps: [
    {
      name: 'probador-v2',
      script: 'node_modules/next/dist/bin/next',
      args: 'start --port 3100',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      env: { NODE_ENV: 'production' },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
