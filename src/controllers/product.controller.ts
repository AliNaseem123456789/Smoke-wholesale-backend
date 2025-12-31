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
/**
 * CATEGORY FILTER (array + case-insensitive)
 */
export const fetchProductsByCategory = async (req: Request, res: Response) => {
  const category = decodeURIComponent(req.params.category).toLowerCase();

  const { data, error } = await supabase.rpc(
    "products_by_category_ci",
    {
      category_input: category,
    }
  );

  if (error) {
    return res.status(500).json({
      message: "Supabase error",
      error: error.message,
    });
  }

  res.json({
    message: "Products fetched by category ✅",
    data,
  });
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
    const shuffled = data.sort(() => 0.5 - Math.random());
    const featured = shuffled.slice(0, 6);
    const newArrivals = data
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6);

    // Best Sellers: pick next 6 random products (or top sales if sales column exists)
    const bestSellers = shuffled.slice(6, 12);

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
