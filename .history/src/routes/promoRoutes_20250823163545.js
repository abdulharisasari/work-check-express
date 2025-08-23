const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/:id/promos', authMiddleware, promoController.addPromo);
router.get('/:id/promos', authMiddleware, promoController.getPromos);

module.exports = router;