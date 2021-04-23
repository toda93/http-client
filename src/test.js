import HttpClient from './index.js';


(async() => {

    const client = new HttpClient({
        agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36',
        cookieFile: '/Users/toda93/Desktop/cookie.json'
    });

    const response = await client
        .addHeader('sec-ch-ua', '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"')
        .addHeader('sec-ch-ua-mobile', '?0')
        .addHeader('upgrade-insecure-requests', '1')
        .addHeader(
            'accept',
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
        )
        .addHeader('sec-fetch-site', 'cross-site')
        .addHeader('sec-fetch-mode', 'navigate')
        .addHeader('sec-fetch-user', '?1')
        .addHeader('sec-fetch-dest', 'document')
        .get('https://www3.animeflv.net');

    console.log(response);
})()