import HttpClient from './index.js';


(async () => {

    const client = new HttpClient({
        proxy: {
            host: '208.70.249.9',
            port: '1333',
            auth: { username: '5e5LSs27778', password: 'U3HYkYRcN6' }
        },
        cookieFile: '/Users/toda93/Desktop/cookie.json'
    });


    let response = await client.get('https://www3.animeflv.net/');
    console.log(response);

    // response = await client.setProxy({
    //     host: '208.70.249.171',
    //     port: '4220',
    //     auth: { username: '5e5LSs27778', password: 'U3HYkYRcN6' }
    // }).get('https://ipv4bot.whatismyipaddress.com/');
    // console.log(response);

    // response = await client.get('https://ipv4bot.whatismyipaddress.com/');
    // console.log(response);
})()