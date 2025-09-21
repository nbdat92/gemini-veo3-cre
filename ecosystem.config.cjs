// PM2 ecosystem configuration for Gemini VEO3 Video Generator
module.exports = {
  apps: [
    {
      name: 'gemini-veo3-generator',
      script: 'app.py',
      cwd: '/home/user/webapp',
      interpreter: '/usr/bin/python3',
      env: {
        FLASK_ENV: 'development',
        FLASK_DEBUG: 'true',
        PYTHONPATH: '/home/user/webapp',
        PORT: 5000,
        HOST: '0.0.0.0'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false, // Disable file watching for stability
      max_memory_restart: '1G',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000
    }
  ]
}