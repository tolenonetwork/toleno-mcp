/**
 * Toleno Public API Client (No Auth)
 * Used for public endpoints that require no authentication.
 */

const https = require('https');
const http  = require('http');

const API_BASE = process.env.TOLENO_API_URL || 'https://api.tolenocoin.com/api';

class TolenoPublicClient {
    constructor() {
        this.base = new URL(API_BASE);
    }

    get(path) {
        return new Promise((resolve, reject) => {
            const fullPath = this.base.pathname.replace(/\/$/, '') + path;
            const isHttps  = this.base.protocol === 'https:';
            const lib      = isHttps ? https : http;

            const options = {
                hostname: this.base.hostname,
                port:     this.base.port || (isHttps ? 443 : 80),
                path:     fullPath,
                method:   'GET',
                headers: {
                    'Accept':     'application/json',
                    'User-Agent': 'TolenoMCP/1.0'
                }
            };

            const req = lib.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`Failed to parse API response: ${data.substring(0, 200)}`));
                    }
                });
            });

            req.on('error', reject);
            req.end();
        });
    }
}

module.exports = TolenoPublicClient;
