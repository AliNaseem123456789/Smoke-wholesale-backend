const { supabase } = require("../lib/supabase");
const { supabaseAdmin } = require("../lib/supabaseAdmin");
const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select(`
        id,
        email,
        role,
        first_name,
        last_name,
        created_at
      `);
    if (error) throw error;
    res.status(200).json(data);
    console.log(req.user);
  } catch (error) {
    console.error("Supabase Error:", error.message);
    res.status(500).json({ message: "Error fetching users from database" });
  }
};
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ role })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    res.status(200).json({ message: "User role updated", user: data });
  } catch (error) {
    res.status(500).json({ message: "Failed to update role" });
  }
};
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};
const createProduct = async (req, res) => {
  console.log("CONTROLLER REACHED: createProduct started");
  try {
    const productData = {
      title: req.body.title,
      brand: req.body.brand,
      description: req.body.description,
      price: parseFloat(req.body.price),
      categories: req.body.category ? [req.body.category] : [],
      created_at: new Date(),
    };
    console.log("Refined Payload for Supabase:", productData);
    const { data, error } = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();
    if (error) {
      console.error(" Supabase DB Error:", error.message);
      return res.status(400).json({
        message: "Database insertion failed",
        details: error.message,
      });
    }
    console.log("Success! Product Created:", data.id);
    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  if (updates.image_url) {
    updates.url = updates.image_url;
    delete updates.image_url;
  }
  try {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select();
    if (error) throw error;
    res.status(200).json(data[0]);
  } catch (error) {
    console.error(" UPDATE ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;
    let query = supabase.from("products").select("*", { count: "exact" });
    if (search) {
      query = query.ilike("title", `%${search}%`);
    }
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;
    res.status(200).json({
      products: data,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
};
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product" });
  }
};
const uploadImage = async (req, res) => {
  try {
    const { productId } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });
    const filePath = `${productId}/1.webp`;
    const { data, error } = await supabaseAdmin.storage
      .from("product-images")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });
    if (error) throw error;
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("product-images").getPublicUrl(filePath);
    return res.status(200).json({ url: publicUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};
const updateFeatureSection = async (req, res) => {
  try {
    const { slotKey, link } = req.body;
    const file = req.file;
    let imageUrl = req.body.existingImage;
    if (file) {
      const filePath = `features/${slotKey}.webp`;
      const { data, error } = await supabaseAdmin.storage
        .from("site-assets")
        .upload(filePath, file.buffer, {
          contentType: "image/webp",
          upsert: true,
        });
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from("site-assets").getPublicUrl(filePath);
      imageUrl = `${publicUrl}?t=${Date.now()}`;
    }
    const { error: dbError } = await supabaseAdmin
      .from("site_settings")
      .upsert({
        key: slotKey,
        value: { image: imageUrl, link: link },
      });
    if (dbError) throw dbError;
    res.status(200).json({ message: "Feature updated", url: imageUrl });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};
const getSiteSettings = async (req, res) => {
  try {
    if (!supabaseAdmin) {
      console.error(
        "Backend Error: supabaseAdmin is not initialized check your .env",
      );
      return res.status(500).json({ message: "Supabase Admin client missing" });
    }
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*");
    if (error) {
      console.error("Supabase Query Error:", error.message);
      return res.status(500).json({ message: error.message });
    }
    res.status(200).json(data || []);
  } catch (error) {
    console.error("General Server Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", details: error.message });
  }
};
module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateProduct,
  createProduct,
  deleteProduct,
  getProducts,
  uploadImage,
  updateFeatureSection,
  getSiteSettings,
};
