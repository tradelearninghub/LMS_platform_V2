module.exports = {
  apps: [
    {
      name: "trade-learning-hub",
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "./",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
    },
  ],
};
