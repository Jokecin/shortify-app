module.exports = {
  apps: [
    {
      name: 'shortify-backend',
      cwd: './backend',
      script: 'src/index.js',
      interpreter: 'node',
      env: {
        PORT: 3001,
	BASE_URL: 'http://18.231.208.120',
        NODE_ENV: 'production'
      },
    },
    {
      name: 'shortify-frontend',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
