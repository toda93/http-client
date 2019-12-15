import HttpClient from './HttpClient';


(async () => {
    const client = new HttpClient();
    const res = await client.get('https://www.google.com/');

    console.log(res);
}
)()

