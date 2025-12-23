module.exports = {
  apps: [
    {
      name: 'securechat-pay',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=webapp-production --local --ip 0.0.0.0 --port 3000',
      node_args: '--stack-size=2048 --max-old-space-size=4096',  // Increase stack to 2MB and heap to 4GB
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
