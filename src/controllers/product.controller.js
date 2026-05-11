const { supabase } = require("../lib/supabase");
const normalizeText = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[\/#&,+._-]+/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");

const fetchProducts = async (_, res) => {
  const { data, error } = await supabase.from("brands").select("*");
  if (error) {
    return res.status(500).json({
      message: "Supabase error",
      error: error.message,
    });
  }

  res.json({
    message: "Supabase connected",
    data,
  });
};

const fetchProductsByBrand = async (req, res) => {
  const brand = decodeURIComponent(req.params.brand);
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("brand", brand);

  if (error) {
    return res
      .status(500)
      .json({ message: "Supabase error", error: error.message });
  }

  res.json({ message: "Products fetched", data });
};
const fetchProductsByCategory = async (req, res) => {
  try {
    if (!req.params.category) {
      return res.status(400).json({ message: "Category is required" });
    }
    const rawCategory = decodeURIComponent(req.params.category);
    const normalizedInput = normalizeText(rawCategory);
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      return res.status(500).json({
        message: "Supabase error",
        error: error.message,
      });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    const filtered = data.filter((p) => {
      if (!Array.isArray(p.categories)) return false;
      return p.categories.some((cat) => {
        if (typeof cat !== "string") return false;
        const normalizedCategory = normalizeText(cat);
        return (
          normalizedCategory === normalizedInput ||
          normalizedCategory.includes(normalizedInput) ||
          normalizedInput.includes(normalizedCategory)
        );
      });
    });

    res.json({
      message: "Products fetched by category",
      data: filtered,
    });
  } catch (err) {
    console.error("Category fetch error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
const fetchHomeProducts = async (_, res) => {
  try {
    const [featuredRes, newArrivalsRes, bestSellersRes] = await Promise.all([
      supabase.from("products").select("*").limit(15),
      supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase.from("products").select("*").range(15, 24),
    ]);
    if (featuredRes.error || newArrivalsRes.error || bestSellersRes.error) {
      return res.status(500).json({ message: "Supabase error" });
    }
    const format = (data) => data.map((p) => ({ ...p, id: p.id.toString() }));
    res.json({
      message: "Home products fetched in parallel",
      data: {
        featured: format(featuredRes.data),
        newArrivals: format(newArrivalsRes.data),
        bestSellers: format(bestSellersRes.data),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const fetchProductById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (error) {
    return res.status(404).json({
      message: "Product not found",
      error: error.message,
    });
  }

  res.json({
    message: "Product fetched",
    data,
  });
};

const addProduct = async (req, res) => {
  try {
    const { title, brand, description, sku, categories, flavors, url } =
      req.body;
    if (!title || !brand) {
      return res.status(400).json({ error: "Title and brand are required" });
    }
    const { data, error } = await supabase
      .from("products")
      .insert([{ title, brand, description, sku, categories, flavors, url }])
      .select()
      .single();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json({
      message: "Product added successfully",
      product: data,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  fetchProducts,
  fetchProductsByBrand,
  fetchProductsByCategory,
  fetchHomeProducts,
  fetchProductById,
  addProduct,
};
