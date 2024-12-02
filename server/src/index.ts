import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json({ limit: '70mb' }));
app.use(cors());

app.get('/', (req, res) => {
	res.send('change me to see updates, express!');
});

if (import.meta.env.PROD) {
	app.listen(3000);
	console.log('listening on http://localhost:3000/');
}

export const viteNodeApp = app;
