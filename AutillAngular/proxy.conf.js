const PROXY_HOST = 'http://localhost:4200/'

const PROXY_CONFIG = [
    {
        context: ['/api/v1'],
        target: PROXY_HOST,
        secure: false
    }
];

module.exports = PROXY_CONFIG;