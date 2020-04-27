import fs from 'fs';
import qs from 'querystring';
import request from 'request';
import {parse} from 'node-html-parser';
import FileCookieStore from './toughCookieFilestore';


const BODY_TYPE = {
    QUERY_URL: 'QUERY_URL',
    FORM: 'FORM',
    JSON: 'JSON',
    RAW_BODY: 'RAW_BODY',
    MULTIPART_RELATED: 'MULTIPART_RELATED',
    MULTIPART_FORM_DATA: 'MULTIPART_FORM_DATA',
};


class HttpClient {
    constructor(options = {}) {
        this.init_opts = {
            followAllRedirects: true,
            timeout: 10 * 1000,
            resolveWithFullResponse: false,
            resolveParseDOM: false,
            resolveJSON: false,
            useCookie: false,
            rejectUnauthorized: false,
            agent: false,
            useAgent: true,
            pool: {maxSockets: 1000},
            headers: {},
            ...options,
        };
        this._resetOptions();
    }

    _resetOptions() {
        this.options = {...this.init_opts};
        this.options.headers = {...this.init_opts.headers};

        if (this.options.useAgent) {
            this.randomAgent();
        }
    }

    _changeOption(option, value) {
        this.options[option] = value;
        return this;
    }

    useCookie(file) {
        return this._changeOption('useCookie', file);
    }

    responseFull() {
        return this._changeOption('resolveWithFullResponse', true);
    }

    responseDOM() {
        return this._changeOption('resolveParseDOM', true);
    }

    responseJSON() {
        return this._changeOption('resolveJSON', true);
    }

    noFollow() {
        this._changeOption('followRedirect', false);
        return this._changeOption('followAllRedirects', false);
    }

    addHeader(name, value) {
        this.options.headers[name] = value;
        return this;
    }

    randomAgent() {
        const agents = JSON.parse(fs.readFileSync(__dirname + '/agents.json', 'utf8'));
        return this.addHeader('User-Agent', agents[Math.floor(Math.random() * agents.length)]);
    }

    head(url, data) {
        return this._requestAPI(url, 'HEAD', data, BODY_TYPE.QUERY_URL);
    }

    get(url, data) {
        return this._requestAPI(url, 'GET', data, BODY_TYPE.QUERY_URL);
    }

    postQueryUrl(url, data) {
        return this._requestAPI(url, 'POST', data, BODY_TYPE.QUERY_URL);
    }

    putQueryUrl(url, data) {
        return this._requestAPI(url, 'PUT', data, BODY_TYPE.QUERY_URL);
    }

    patchQueryUrl(url, data) {
        return this._requestAPI(url, 'PATCH', data, BODY_TYPE.QUERY_URL);
    }


    post(url, data) {
        return this._requestAPI(url, 'POST', data, BODY_TYPE.FORM);
    }

    put(url, data) {
        return this._requestAPI(url, 'PUT', data, BODY_TYPE.FORM);
    }

    patch(url, data) {
        return this._requestAPI(url, 'PATCH', data, BODY_TYPE.FORM);
    }


    postJSON(url, data) {
        return this._requestAPI(url, 'POST', data, BODY_TYPE.JSON);
    }

    putJSON(url, data) {
        return this._requestAPI(url, 'PUT', data, BODY_TYPE.JSON);
    }

    patchJSON(url, data) {
        return this._requestAPI(url, 'PATCH', data, BODY_TYPE.JSON);
    }


    postRaw(url, data) {
        return this._requestAPI(url, 'POST', data, BODY_TYPE.RAW_BODY);
    }

    putRaw(url, data) {
        return this._requestAPI(url, 'PUT', data, BODY_TYPE.RAW_BODY);
    }

    patchRaw(url, data) {
        return this._requestAPI(url, 'PATCH', data, BODY_TYPE.RAW_BODY);
    }

    postMultipartFormData(url, data) {
        return this._requestAPI(url, 'POST', data, BODY_TYPE.MULTIPART_FORM_DATA);
    }

    putMultipartFormData(url, data) {
        return this._requestAPI(url, 'PUT', data, BODY_TYPE.MULTIPART_FORM_DATA);
    }

    patchMultipartFormData(url, data) {
        return this._requestAPI(url, 'PATCH', data, BODY_TYPE.MULTIPART_FORM_DATA);
    }

    postMultipart(url, data) {
        return this._requestAPI(url, 'POST', data, BODY_TYPE.MULTIPART_RELATED);
    }

    putMultipart(url, data) {
        return this._requestAPI(url, 'PUT', data, BODY_TYPE.MULTIPART_RELATED);
    }

    patchMultipart(url, data) {
        return this._requestAPI(url, 'PATCH', data, BODY_TYPE.MULTIPART_RELATED);
    }


    download(url, fileDir, minSize = 0) {
        const file = fs.createWriteStream(fileDir);

        this.options.url = encodeURI(url);

        return new Promise((resolve, reject) => {
            request(this.options).pipe(file).on('finish', () => {
                const stats = fs.statSync(fileDir);
                if (stats['size'] < minSize) {
                    reject(`file size ${stats['size']}`);
                } else {
                    resolve(true);
                }
            }).on('error', (err) => {
                reject(err);
            });
        });
    }

    _requestAPI(url, method = 'GET', body = null, body_type) {
        if (body_type === BODY_TYPE.QUERY_URL) {
            body && (url += (!url.includes('?') ? '?' : '&') + qs.stringify(body));
        } else if (body_type === BODY_TYPE.JSON) {
            this.options.json = true;
            this.options.body = body;
        } else if (body_type === BODY_TYPE.RAW_BODY) {
            this.options.body = body;
        } else if (body_type === BODY_TYPE.FORM) {
            this.options.form = body;
        } else if (body_type === BODY_TYPE.MULTIPART_RELATED) {
            this.options.multipart = body;
        } else if (body_type === BODY_TYPE.MULTIPART_FORM_DATA) {
            this.options.formData = body;
        }
        this.options.url = encodeURI(url);
        this.options.method = method;

        if (this.options.useCookie) {
            if (!fs.existsSync(this.options.useCookie)) {
                fs.closeSync(fs.openSync(this.options.useCookie, 'w'));
            }
            this.options.jar = request.jar(new FileCookieStore(this.options.useCookie));
        }

        return new Promise((resolve, reject) => {
            request(this.options, (err, response, body) => {
                if (err) return reject(err);
                try {
                    if (this.options.resolveWithFullResponse) {
                        return resolve(response);
                    }
                    if (this.options.resolveParseDOM) {
                        return resolve(parse(body));
                    }
                    if (this.options.resolveJSON) {
                        try {
                            const data = JSON.parse(body);
                            return resolve(data);
                        } catch (err) {
                            return reject(body);
                        }
                    }
                    return resolve(body);
                } catch (err) {
                    return reject(err);
                } finally {
                    this._resetOptions();
                }
            });
        });
    }
}


export default HttpClient;
