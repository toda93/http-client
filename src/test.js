import HttpClient from './index.js';


(async () => {
	const client = new HttpClient({
		proxy: {
			host: '208.70.249.9',
			port: '1333',
			auth: {
				username: '5e5LSs27778',
				password: 'U3HYkYRcN6'
			}
		}
	});

	const res = await client.get('http://animeflv.net');

	console.log(res);
})();