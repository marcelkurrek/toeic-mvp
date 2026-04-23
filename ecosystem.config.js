module.exports = {
  apps: [
    {
      name: 'toeic-mvp',
      script: 'npm',
      args: 'run start',
      cwd: '/workspaces/toeic-mvp',
      autorestart: true,
      restart_delay: 2000,
      exp_backoff_restart_delay: 100,
      max_restarts: 9999,
      watch: false,
      merge_logs: true,
      out_file: '/home/codespace/.pm2/logs/toeic-mvp-out.log',
      error_file: '/home/codespace/.pm2/logs/toeic-mvp-error.log',
    },
  ],
}
