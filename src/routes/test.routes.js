// src/routes/test.routes.js
const { Router } = require('express');
const { testSupabase } = require('../controllers/test.controller');

const router = Router();

router.get('/supabase', testSupabase);

module.exports = router; // ✅ export for CommonJS
//this is php version