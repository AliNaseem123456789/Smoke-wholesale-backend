const { supabase } = require("../lib/supabase");
const fetchCartProducts = async (req, res) => {
  const user_id = req.user.id;

  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `
      quantity,
      product_id,
      products (
        id,
        title,
        brand,
        price,
        description,
        url,
        flavors,
        categories
      )
    `,
    )
    .eq("user_id", user_id);

  if (error) {
    console.error("Supabase Error:", error.message);
    return res.status(400).json({
      message: "Supabase error",
      error: error.message,
    });
  }
  // console.log("Joined Data Sample:", data[0]);
  res.status(200).json(data);
};
const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const payload = {
    user_id: req.user.id,
    product_id: productId,
    quantity: quantity || 1,
  };
  const { data, error } = await supabase
    .from("cart_items")
    .upsert(payload, { onConflict: "user_id, product_id" })
    .select();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.status(201).json(data);
};

const updateQuantity = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const { data, error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .match({ user_id: req.user.id, product_id: productId })
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data[0]);
};
const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .match({ user_id: req.user.id, product_id: productId });

  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
};
const saveCartTemplate = async (req, res) => {
  try {
    const { cartName, items, totalAmount } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("saved_carts")
      .insert([
        {
          user_id: userId,
          cart_name: cartName,
          items: items,
          total_amount: totalAmount,
        },
      ])
      .select();

    if (error) {
      console.error("SUPABASE_INSERT_ERROR:", error);
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json({ message: "Saved!", savedCart: data[0] });
  } catch (error) {
    console.error("SERVER_CRASH:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchSavedTemplates = async (req, res) => {
  const user_id = req.user.id;

  const { data, error } = await supabase
    .from("saved_carts")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json({ data });
};

const fetchSavedTemplateDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: template, error: tError } = await supabase
      .from("saved_carts")
      .select("*")
      .eq("id", id)
      .single();

    if (tError || !template)
      return res.status(404).json({ message: "Template not found" });

    const productIds = template.items.map((i) => i.product_id);
    const { data: products, error: pError } = await supabase
      .from("products")
      .select("id, title, brand")
      .in("id", productIds);

    if (pError) return res.status(400).json({ error: pError.message });

    const products_details = template.items.map((item) => {
      const p = products.find((prod) => prod.id === item.product_id);
      return {
        ...p,
        quantity: item.quantity,
      };
    });

    res.status(200).json({ data: { ...template, products_details } });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  fetchCartProducts,
  addToCart,
  updateQuantity,
  removeFromCart,
  saveCartTemplate,
  fetchSavedTemplates,
  fetchSavedTemplateDetails,
};
