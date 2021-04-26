import HttpClient from './index.js';


(async () => {

    const client = new HttpClient();

    let response = await client.get('https://ipv4bot.whatismyipaddress.com/');
    console.log(response);

})()