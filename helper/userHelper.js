import { client } from './../index.js';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

async function getAllUser() {
	return await client.db('ecommerce').collection('user').find({}).toArray();
}

async function genPassword(password) {
	const salt = await bcrypt.genSalt(10);

	const hashedPassword = await bcrypt.hash(password, salt);

	return hashedPassword;
}

async function validateUser(user_email) {
	return await client
		.db('ecommerce')
		.collection('user')
		.findOne({ user_email: user_email }, { projection: { _id: 1, user_name: 1, password: 1 } });
}

async function createUser(data) {
	return await client.db('ecommerce').collection('user').insertOne(data);
}

async function createNewOrder(id, data) {
	return await client
		.db('ecommerce')
		.collection('user')
		.updateOne({ _id: ObjectId(id) }, { $push: { user_order: data } }, { upsert: true });
}

async function addToCart(id, data) {
	return await client
		.db('ecommerce')
		.collection('user')
		.updateOne({ _id: ObjectId(id) }, { $push: { user_cart: data } }, { upsert: true });
}
export { getAllUser, genPassword, createUser, validateUser, createNewOrder, addToCart };
