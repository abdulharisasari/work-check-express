const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, storeController.getStores);
router.get('/:id', authMiddleware, storeController.getStoreById);
router.get('/:id/products', authMiddleware, storeController.getProducts);
router.post('/:id/products/batch', authMiddleware, storeController.batchUpdateProducts);

module.exports = router;