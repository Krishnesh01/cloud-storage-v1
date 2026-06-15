module.exports = {
    apps: [
        {
            name: 'cloud-storage-api',
            script: 'server.js',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
                PORT: process.env.PORT || 5000
            }
        }
    ]
};
