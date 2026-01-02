// src/routes/test.routes.js
const { Router } = require('express');
const { testSupabase } = require('../controllers/test.controller');

const router = Router();

router.get('/supabase', testSupabase);

module.exports = router; // ✅ export for CommonJS

// Vaporesso Coils & Pods
// LAW Black 1 1/4 24pk
// Cannabis Design #48927 By Zippo
// Geek Vape Coils & Pods   works for details but not for main page
// 
// Original Cannoli By BAMS    works for details but not for main page
// MAG Solo Kit By Smok
//HY BIRD - Monster Rig Set
// Vaporesso Coils & Pods
// NFL New York Jets Design #46459 By Zippo