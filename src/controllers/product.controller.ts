import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export const fetchProducts = async (_: Request, res: Response) => {
  const { data, error } = await supabase
    .from('brands')
    .select('*');

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
export const fetchProductsByBrand = async (req: Request, res: Response) => {
  const brand = decodeURIComponent(req.params.brand); // <-- decode it
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('brand', brand);

  if (error) {
    return res.status(500).json({ message: 'Supabase error', error: error.message });
  }

  res.json({ message: 'Products fetched ✅', data });
};

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[\/#&,+._-]+/g, ' ')   // replace symbols with space
    .replace(/[^a-z0-9\s]/g, '')    // remove non-alphanumeric
    .replace(/\s+/g, ' ');          // collapse multiple spaces

export const fetchProductsByCategory = async (req: Request, res: Response) => {
  try {
    if (!req.params.category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    // Decode + normalize input
    const rawCategory = decodeURIComponent(req.params.category);
    const normalizedInput = normalizeText(rawCategory);

    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      return res.status(500).json({
        message: 'Supabase error',
        error: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    // Failsafe category matching
    const filtered = data.filter((p: any) => {
      if (!Array.isArray(p.categories)) return false;

      return p.categories.some((cat: string) => {
        if (typeof cat !== 'string') return false;

        const normalizedCategory = normalizeText(cat);

        return (
          normalizedCategory === normalizedInput ||                 // exact match
          normalizedCategory.includes(normalizedInput) ||           // partial
          normalizedInput.includes(normalizedCategory)              // reverse partial
        );
      });
    });

    res.json({
      message: 'Products fetched by category ✅',
      data: filtered,
    });
  } catch (err: any) {
    console.error('Category fetch error:', err);
    res.status(500).json({
      message: 'Server error',
      error: err.message,
    });
  }
};
export const fetchHomeProducts = async (_: Request, res: Response) => {
  try {
    // Fetch all products
    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) {
      return res.status(500).json({ message: "Supabase error", error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    // Shuffle products for randomness
    const shuffled = data.sort(() => 0.5 - Math.random());

    // Featured: 15 random products
    const featured = shuffled.slice(0, 15);

    // New Arrivals: 10 newest products by created_at
    const newArrivals = data
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    // Best Sellers: next 10 random products after featured
    const bestSellers = shuffled.slice(15, 25);

    res.json({
      message: "Home products fetched ✅",
      data: {
        featured,
        newArrivals,
        bestSellers,
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// products details
export const fetchProductById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id",  Number(id))
    .single();

  if (error) {
    return res.status(404).json({
      message: "Product not found",
      error: error.message,
    });
  }

  res.json({
    message: "Product fetched ✅",
    data,
  });
};
