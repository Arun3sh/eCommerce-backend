import { ObjectId } from 'mongodb';
import { client } from './../index.js';

async function getHomepage() {
	return await client.db('ecommerce').collection('homepage').find({}).toArray();
}

async function getFilteredProduct(filter) {
	return await client
		.db('ecommerce')
		.collection('product')
		.find(filter)
		.sort({ price: 1 })
		.toArray();
}

async function addProduct(data) {
	return await client.db('ecommerce').collection('product').insertMany(data);
}

async function addHomeProduct(data) {
	return await client.db('ecommerce').collection('homeproduct').insertMany(data);
}

async function reduceProductQty(id, reduceQty) {
	return await client
		.db('ecommerce')
		.collection('product')
		.updateOne({ _id: ObjectId(id) }, { $set: { qty: { $subtract: ['$qty', reduceQty] } } });
}

export { getHomepage, getFilteredProduct, addProduct, addHomeProduct, reduceProductQty };
