import express from 'express';
import { response } from 'express';
import { ObjectId } from 'mongodb';
import {
	getHomepage,
	getFilteredProduct,
	addProduct,
	addHomeProduct,
} from '../helper/product_helper.js';

const router = express.Router();

// To get home page products
router.get('/homepage', async (request, response) => {
	const home = await getHomepage();
	response.send(home);
});

// To get product based on id
router.get('/:id', async (request, response) => {
	const { id } = request.params;
	const result = await getFilteredProduct({ _id: ObjectId(id) });
	response.send(result);
});

// To get product based on query
router.get('/', async (request, response) => {
	const filter = request.query;

	// Filter by price, category
	if (filter.category && filter.Starting & filter.Under) {
		const filterProduct = await getFilteredProduct({
			category: filter.category,
			price: { $gte: +filter.Starting, $lte: +filter.Under },
		});

		response.send(filterProduct);
		return;
	}

	// Filter by price
	if (filter.Starting && filter.Under) {
		const filterProduct = await getFilteredProduct({
			price: { $gte: +filter.Starting, $lte: +filter.Under },
		});

		response.send(filterProduct);
		return;
	}

	// Filter by category and price under
	if (filter.category && filter.Under) {
		const filterProduct = await getFilteredProduct({
			category: filter.category,
			price: { $lte: +filter.Under },
		});

		response.send(filterProduct);
		return;
	}

	// Filter by category and price above
	if (filter.category && filter.Starting) {
		const filterProduct = await getFilteredProduct({
			category: filter.category,
			price: { $gte: +filter.Starting },
		});

		response.send(filterProduct);
		return;
	}

	if (filter.category && filter.search) {
		if (filter.category === 'All Categories') {
			const searchProduct = await getFilteredProduct({
				product_name: { $regex: filter.search, $options: 'i' },
			});
			response.send(searchProduct);
			return;
		}
		const searchProductWithCat = await getFilteredProduct({
			category: filter.category,
			product_name: { $regex: filter.search, $options: 'i' },
		});
		response.send(searchProductWithCat);
		return;
	}

	const getFiltered = await getFilteredProduct(filter);

	response.send(getFiltered);
});

// To add multiple products
router.post('/add-product', async (request, response) => {
	const data = request.body;
	const add = await addProduct(data);
	response.send(add);
});

// To add multiple products
router.post('/add-home-product', async (request, response) => {
	const data = request.body;
	const add = await addHomeProduct(data);
	response.send(add);
});

// To remove product
router.delete('/:id', async (request, response) => {
	const { id } = request.params;
	response.send('wait');
});

export const productRouter = router;
