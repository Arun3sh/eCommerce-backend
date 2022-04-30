import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import { reduceProductQty } from '../helper/product_helper.js';
import {
	getAllUser,
	genPassword,
	validateUser,
	createUser,
	viewOrder,
	viewCart,
	updateCart,
	addToCartLogin,
	addToCart,
	cleanUp,
	deleteCart,
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
	const { user_email, password, user_name, user_address, contact, user_cart } = request.body;
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
		user_cart: user_cart,
	});

	response.send(userCreate);
});

// For user login
router.post('/login-user', async (request, response) => {
	const { user_email, password, data } = request.body;

	const validate = await validateUser(user_email);

	if (validate === null) {
		response.status(401).send('Email / Password incorrect');
		return;
	}

	const checkPassword = await bcrypt.compare(password, validate.password);

	if (checkPassword) {
		const token = jwt.sign({ id: validate._id }, process.env.SECRET_KEY);

		// To check if same product is already in cart and update its count is present
		{
			data.map(async (e) => {
				const updateQty = await updateCart(validate._id, e);

				// If the product isn't there it is added to cart
				if (updateQty.modifiedCount === 0) {
					await addToCartLogin(validate._id, e);
				}
			});
		}

		response.header('x-auth-token', token).send({
			token: token,
			id: validate._id,
			user_name: validate.user_name,
			user_email: user_email,
		});

		return;
	}

	response.status(401).send('Email / Password incorrect');
});

// View Cart
router.get('/view-cart/:id', auth, async (request, response) => {
	const { id } = request.params;

	const view = await viewCart(id);

	response.send(view);
});

// Add to cart
router.put('/add-to-cart/:id', auth, async (request, response) => {
	const data = request.body;
	const { id } = request.params;

	const add = await addToCart(id, data);
	if (add.acknowledged) {
		const clean = await cleanUp(id);

		response.send(clean);
		return;
	}

	response.send(add);
});

// Remove from cart
router.put('/remove-cart/:id', auth, async (request, response) => {
	const { id } = request.params;
	const remove = await deleteCart(id);
	response.send(remove);
});

// To view order
router.get('/view-order/:id', auth, async (request, response) => {
	// const data = request.body;
	const { id } = request.params;

	// Has to edit on how to change value in helper

	const create_order = await viewOrder(id);

	response.send(create_order);
});

export const userRouter = router;
