import fs from 'fs';
import qs from 'querystring';
import { parse } from 'node-html-parser';
import axios from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { FileCookieStore } from 'tough-cookie-file-store';
import http from 'http';
import https from 'https';
import HttpsProxyAgent from 'https-proxy-agent';

import agents from './agents';


axiosCookieJarSupport(axios);

class HttpClient {
    constructor(options = {}) {
        this.initOpts = {
            cookieFile: null,
            proxy: false,
            timeout: 10 * 1000,
            maxRedirects: 5,
            resolveWithFullResponse: false,
            resolveParseDOM: false,
            resolveJSON: false,
            httpAgent: new http.Agent({ keepAlive: true }),
            httpsAgent: new https.Agent({ keepAlive: true }),
            validateStatus: function(status) {
                return status >= 200 && status < 500; // default
            },
            ...options,
        };
        this._resetOptions();
    }

    _resetOptions() {
        this.options = { ...this.initOpts };
        this.options.headers = {
            ...this.initOpts.headers
        };

        if (this.initOpts.cookieFile) {
            this.setCookieFile(this.initOpts.cookieFile);
        }
        if (this.initOpts.proxy) {
            this.setProxy(this.initOpts.proxy);
        }
    }

    _changeOption(option, value) {
        this.options[option] = value;
        return this;
    }

    setProxy(proxy) {
        this._changeOption('proxy', proxy);
        let proxyString = `${proxy.host}:${proxy.port}`;
        if (proxy.auth) {
            proxyString = `${proxy.auth.username}:${proxy.auth.password}@${proxyString}`;
        }
        const httpsAgent = new HttpsProxyAgent(`http://${proxyString}`);
        return this._changeOption('httpsAgent', httpsAgent);
    }

    setCookieFile(cookiePath) {
        const jar = new CookieJar(new FileCookieStore(this.initOpts.cookieFile));

        this._changeOption('jar', jar);
        return this._changeOption('withCredentials', true);
    }


    randomAgent() {
        return this.addHeader('User-Agent', agents[Math.floor(Math.random() * agents.length)]);
    }

    responseFull() {
        return this._changeOption('resolveWithFullResponse', true);
    }

    responseDOM() {
        return this._changeOption('resolveParseDOM', true);
    }

    responseText() {
        return this._changeOption('responseType', 'text');
    }

    noFollow() {
        return this._changeOption('maxRedirects', 0);
    }

    addHeader(name, value) {
        this.options.headers[name] = value;
        return this;
    }

    head(url, data) {
        return this._requestAPI(url, 'head', data);
    }

    get(url, data) {
        return this._requestAPI(url, 'get', data);
    }

    delete(url, data) {
        return this._requestAPI(url, 'delete', data);
    }

    post(url, data, stringify = true) {
        return this._requestAPI(url, 'post', data, stringify);
    }

    put(url, datastringify = true) {
        return this._requestAPI(url, 'put', data, stringify);
    }

    patch(url, data, stringify = true) {
        return this._requestAPI(url, 'patch', data, stringify);
    }


    download(url, filePath, minSize = 0, method = 'get') {
        const file = fs.createWriteStream(filePath);

        this.options = {
            ...this.options,
            method,
            responseType: 'stream',
            url: encodeURI(url),
        };

        if (url.startsWith('https')) {
            this._changeOption('proxy', false);
        }

        return new Promise((resolve, reject) => {
            axios(this.options).then((response) => {
                response.data.pipe(file);
                file.on('finish', () => {
                    const stats = fs.statSync(filePath);
                    if (stats['size'] < minSize) {
                        reject(`file size ${stats['size']}`);
                    } else {
                        resolve(true);
                    }
                })
                file.on('error', (error) => {
                    reject(error.toString());
                })
            });
        });
    }

    _requestAPI(url, method = 'get', body = null, stringify = true) {
        url = encodeURI(url);
        if (method === 'get') {
            body && (url += '?' + qs.stringify(body));
        } else {
            if (stringify) {
                body = qs.stringify(body);
            }
            this.options.data = body;
        }
        this.options.method = method;
        this.options.url = url;

        if (url.startsWith('https')) {
            this._changeOption('proxy', false);
        }

        return new Promise((resolve, reject) => {
            axios(this.options).then((response) => {
                if (this.options.resolveWithFullResponse) {
                    resolve({
                        headers: response.headers,
                        body: response.data,
                        statusCode: response.status
                    });
                }
                if (this.options.resolveParseDOM) {
                    resolve(parse(response.data));
                }

                resolve(response.data);
            }).catch((error) => {
                console.error(error);
                reject(error.toString());
            }).finally(() => {
                this._resetOptions();
            });
        });
    }
}


export default HttpClient;