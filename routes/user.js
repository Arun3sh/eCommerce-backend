import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import { reduceProductQty } from '../helper/product_helper.js';
import {
	getAllUser,
	genPassword,
	validateUser,
	createUser,
	createNewOrder,
	addToCart,
} from '../helper/userHelper.js';
import { auth } from './auth.js';

const router = express.Router();

// To get all user
router.get('/', async (request, response) => {
	const getUser = await getAllUser();
	response.send(getUser);
});

// To create new user
router.post('/create-user', async (request, response) => {
	const { user_email, password, user_name, user_address, contact } = request.body;
	const check = await validateUser(user_email);

	if (check) {
		response.status(401).send('User email exists');
		return;
	}

	const hashPassword = await genPassword(password);

	const userCreate = await createUser({
		user_name: user_name,
		user_email: user_email,
		password: hashPassword,
		user_address: user_address,
		contact: contact,
	});

	response.send(userCreate);
});

// For user login
router.post('/login-user', async (request, response) => {
	const { user_email, password } = request.body;
	const validate = await validateUser(user_email);

	if (validate === null) {
		response.status(401).send('Email / Password incorrect');
		return;
	}

	const checkPassword = await bcrypt.compare(password, validate.password);

	if (checkPassword) {
		const token = jwt.sign({ id: validate._id }, process.env.SECRET_KEY);

		response.header('x-auth-token', token).send({ token: token, id: validate._id });

		return;
	}

	response.status(401).send('Email / Password incorrect');
});

// Add to cart
router.put('/add-to-cart/:id', async (request, response) => {
	const data = request.body;
	const { id } = request.params;

	const add = await addToCart(id, data);
	response.send(add);
});

// Create new order
router.put('/create-order', auth, async (request, response) => {
	const data = request.body;
	const { id } = request.params;

	// Has to edit on how to change value in helper
	const reduceQty = await reduceProductQty(data._id, selected_qty);
	console.log(reduceQty);
	const create_order = await createNewOrder(id, data);
	response.send(create_order);
});

export const userRouter = router;
