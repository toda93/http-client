import fs from 'fs';
import qs from 'querystring';
import { parse } from 'node-html-parser';
import axios from 'axios';
import http from 'http';


const agents = JSON.parse(fs.readFileSync(__dirname + '/agents.json', 'utf8'));

class HttpClient {
    constructor(options = {}) {
        this.init_opts = {
            timeout: 10 * 1000,
            maxRedirects: 5,
            resolveWithFullResponse: false,
            resolveParseDOM: false,
            resolveJSON: false,
            httpAgent: new http.Agent({ keepAlive: true }),
            ...options,
        };
        this._resetOptions();
    }

    _resetOptions() {
        this.options = { ...this.init_opts };
        this.options.headers = {
            ...this.init_opts.headers
        };
    }

    _changeOption(option, value) {
        this.options[option] = value;
        return this;
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

    post(url, data) {
        return this._requestAPI(url, 'post', data);
    }

    put(url, data) {
        return this._requestAPI(url, 'put', data);
    }

    patch(url, data) {
        return this._requestAPI(url, 'patch', data);
    }


    download(url, fileDir, minSize = 0) {
        const file = fs.createWriteStream(fileDir);
        this.options.url = encodeURI(url);

        return new Promise((resolve, reject) => {
            axios({
                ...this.options,
                responseType: 'stream',
            }).then((response) => {
                response.data.pipe(file);
                response.data.on('finish', () => {
                    const stats = fs.statSync(fileDir);
                    if (stats['size'] < minSize) {
                        reject(`file size ${stats['size']}`);
                    } else {
                        resolve(true);
                    }
                })
                response.data.on('error', () => {
                    reject();
                })
            });
        });
    }

    _requestAPI(url, method = 'get', body = null, stringify = true) {
        if (method === 'get') {
            body && (url += '?' + qs.stringify(body));
        } else {
            if (stringify) {
                body = qs.stringify(body);
            }
            this.options.data = body;
        }

        this.options.url = encodeURI(url);
        this.options.method = method;

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
                reject(error);
            }).finally(() => {
                this._resetOptions();
            });
        });
    }
}


export default HttpClient;