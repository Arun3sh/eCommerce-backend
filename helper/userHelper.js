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
		.findOne(
			{ user_email: user_email },
			{ projection: { _id: 1, user_name: 1, password: 1, user_cart: 1 } }
		);
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

async function viewCart(id) {
	return await client
		.db('ecommerce')
		.collection('user')
		.findOne({ _id: ObjectId(id) }, { projection: { _id: 0, user_cart: 1 } });
}

async function updateCart(id, data) {
	return await client
		.db('ecommerce')
		.collection('user')
		.updateOne(
			{
				_id: ObjectId(id),
				user_cart: { $elemMatch: { _id: data._id } },
			},
			{ $inc: { 'user_cart.$[filter].qty': data.qty } },
			{ arrayFilters: [{ 'filter._id': data._id }] }
		);
}

async function addToCartLogin(id, data) {
	return await client
		.db('ecommerce')
		.collection('user')
		.updateOne(
			{
				_id: ObjectId(id),
			},
			{ $push: { user_cart: data } },
			{ upsert: true }
		);
}

async function addToCart(id, data) {
	return await client
		.db('ecommerce')
		.collection('user')
		.updateOne(
			{
				_id: ObjectId(id),
			},
			{ $set: { user_cart: data } }
		);
}

async function cleanUp(id) {
	return await client
		.db('ecommerce')
		.collection('user')
		.updateOne(
			{
				_id: ObjectId(id),
				user_cart: { $elemMatch: { qty: 0 } },
			},
			{ $pull: { user_cart: { qty: 0 } } }
		);
}

async function deleteCart(id) {
	return await client
		.db('ecommerce')
		.collection('user')
		.updateOne({ _id: ObjectId(id) }, { $set: { user_cart: [] } });
}

async function viewOrder(id) {
	return await client
		.db('ecommerce')
		.collection('user')
		.findOne({ _id: ObjectId(id) }, { projection: { _id: 0, user_order: 1 } });
}

export {
	getAllUser,
	genPassword,
	createUser,
	validateUser,
	createNewOrder,
	updateCart,
	addToCartLogin,
	addToCart,
	viewCart,
	cleanUp,
	deleteCart,
	viewOrder,
};
