const express = require('express');
const router = express.Router();
const Auto = require('../models/Auto');

// GET /api/autos con paginación, filtros y ordenamiento
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        
        const filter = query ? { categoria: query } : {}; 
        
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort ? { precio: sort === 'asc' ? 1 : -1 } : {},
            lean: true
        };

        const result = await Auto.paginate(filter, options);

        res.json({
            status: "success",
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/api/autos?page=${result.prevPage}&limit=${limit}` : null,
            nextLink: result.hasNextPage ? `/api/autos?page=${result.nextPage}&limit=${limit}` : null
        });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

module.exports = router;