// controllers/product.controller.js
const { supabase } = require('../lib/supabase');

// Helper to normalize text
const normalizeText = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[\/#&,+._-]+/g, ' ') // replace symbols with space
    .replace(/[^a-z0-9\s]/g, '')   // remove non-alphanumeric
    .replace(/\s+/g, ' ');         // collapse multiple spaces

// Fetch all brands
const fetchProducts = async (_, res) => {
  const { data, error } = await supabase.from('brands').select('*');

  if (error) {
    return res.status(500).json({
      message: 'Supabase error',
      error: error.message
    });
  }

  res.json({
    message: 'Supabase connected ✅',
    data
  });
};

// Fetch products by brand
const fetchProductsByBrand = async (req, res) => {
  const brand = decodeURIComponent(req.params.brand);
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('brand', brand);

  if (error) {
    return res.status(500).json({ message: 'Supabase error', error: error.message });
  }

  res.json({ message: 'Products fetched ✅', data });
};

// Fetch products by category
const fetchProductsByCategory = async (req, res) => {
  try {
    if (!req.params.category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const rawCategory = decodeURIComponent(req.params.category);
    const normalizedInput = normalizeText(rawCategory);

    const { data, error } = await supabase.from('products').select('*');

    if (error) {
      return res.status(500).json({
        message: 'Supabase error',
        error: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    const filtered = data.filter((p) => {
      if (!Array.isArray(p.categories)) return false;

      return p.categories.some((cat) => {
        if (typeof cat !== 'string') return false;
        const normalizedCategory = normalizeText(cat);
        return (
          normalizedCategory === normalizedInput ||
          normalizedCategory.includes(normalizedInput) ||
          normalizedInput.includes(normalizedCategory)
        );
      });
    });

    res.json({
      message: 'Products fetched by category ✅',
      data: filtered,
    });
  } catch (err) {
    console.error('Category fetch error:', err);
    res.status(500).json({
      message: 'Server error',
      error: err.message,
    });
  }
};

// Fetch home products
const fetchHomeProducts = async (_, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*');

    if (error) {
      return res.status(500).json({ message: 'Supabase error', error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    const productsWithStringIds = data.map((p) => ({ ...p, id: p.id.toString() }));
    const shuffled = [...productsWithStringIds].sort(() => 0.5 - Math.random());

    const featured = shuffled.slice(0, 15);
    const newArrivals = [...productsWithStringIds]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
    const bestSellers = shuffled.slice(15, 25);

    res.json({
      message: 'Home products fetched ✅',
      data: { featured, newArrivals, bestSellers },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Fetch single product by ID
const fetchProductById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', Number(id))
    .single();

  if (error) {
    return res.status(404).json({
      message: 'Product not found',
      error: error.message,
    });
  }

  res.json({
    message: 'Product fetched ✅',
    data,
  });
};

module.exports = {
  fetchProducts,
  fetchProductsByBrand,
  fetchProductsByCategory,
  fetchHomeProducts,
  fetchProductById
};
