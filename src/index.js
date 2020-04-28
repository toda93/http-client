import fs from 'fs';
import qs from 'querystring';
import axios from 'axios';
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

const agents = JSON.parse(fs.readFileSync(__dirname + '/agents.json', 'utf8'));

class HttpClient {
    
}


export default HttpClient;
