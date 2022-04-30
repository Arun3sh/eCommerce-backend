import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { userRouter } from './routes/user.js';
import { productRouter } from './routes/product.js';
import { paymentRouter } from './routes/payment.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

async function createConnection() {
	const client = new MongoClient(MONGO_URL);
	await client.connect();
	console.log('mongo');
	return client;
}

export const client = await createConnection();

app.get('/', (request, response) => {
	response.send('eCommerce');
});

app.use('/user', userRouter);
app.use('/product', productRouter);
app.use('/payment', paymentRouter);

app.listen(PORT, () => console.log('server started', PORT));
