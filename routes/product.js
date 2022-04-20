import express from 'express';
import { getFilteredProduct, addProduct } from '../helper/product_helper.js';

const router = express.Router();

// To get product based on query
router.get('/', async (request, response) => {
	const filter = request.query;

	// Filter by price, category
	if (filter.category && filter.priceabove & filter.priceunder) {
		const filterProduct = await getFilteredProduct({
			category: filter.category,
			price: { $gte: +filter.priceabove, $lte: +filter.priceunder },
		});

		response.send(filterProduct);
		return;
	}

	// Filter by price
	if (filter.priceabove && filter.priceunder) {
		const filterProduct = await getFilteredProduct({
			price: { $gte: +filter.priceabove, $lte: +filter.priceunder },
		});

		response.send(filterProduct);
		return;
	}

	// Filter by category and price under
	if (filter.category && filter.priceunder) {
		const filterProduct = await getFilteredProduct({
			category: filter.category,
			price: { $lte: +filter.priceunder },
		});

		response.send(filterProduct);
		return;
	}

	// Filter by category and price above
	if (filter.category && filter.priceabove) {
		const filterProduct = await getFilteredProduct({
			category: filter.category,
			price: { $gte: +filter.priceabove },
		});

		response.send(filterProduct);
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

export const productRouter = router;
