/**
 * Toleno API Client (Authenticated)
 * Handles requests that require a personal API key (tlno_...).
 */

const https = require('https');
const http  = require('http');

const API_BASE = process.env.TOLENO_API_URL || 'https://api.tolenocoin.com/api';

class TolenoClient {
    constructor(apiKey) {
        if (!apiKey) throw new Error('TOLENO_API_KEY is required for authenticated tools');
        this.apiKey = apiKey;
        this.base   = new URL(API_BASE);
    }

    request(method, path, body = null) {
        return new Promise((resolve, reject) => {
            const fullPath = this.base.pathname.replace(/\/$/, '') + path;
            const isHttps  = this.base.protocol === 'https:';
            const lib      = isHttps ? https : http;
            const payload  = body ? JSON.stringify(body) : null;

            const options = {
                hostname: this.base.hostname,
                port:     this.base.port || (isHttps ? 443 : 80),
                path:     fullPath,
                method:   method.toUpperCase(),
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type':  'application/json',
                    'Accept':        'application/json',
                    'Accept-Language': 'en',
                    'User-Agent':    'TolenoMCP/1.0'
                    // No X-App-Version  → version-check middleware skips
                    // No Android UA     → Play Integrity middleware skips
                }
            };

            if (payload) options.headers['Content-Length'] = Buffer.byteLength(payload);

            const req = lib.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (res.statusCode >= 400) {
                            const err = new Error(parsed.message || `HTTP ${res.statusCode}`);
                            err.status = res.statusCode;
                            err.data   = parsed;
                            reject(err);
                        } else {
                            resolve(parsed);
                        }
                    } catch (e) {
                        reject(new Error(`Failed to parse API response: ${data.substring(0, 200)}`));
                    }
                });
            });

            req.on('error', reject);
            if (payload) req.write(payload);
            req.end();
        });
    }

    get(path)         { return this.request('GET',  path); }
    post(path, body)  { return this.request('POST', path, body || {}); }
}

module.exports = TolenoClient;
