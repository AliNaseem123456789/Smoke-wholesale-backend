const { supabase } = require("../lib/supabase");

const checkout = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const userId = req.user.id.toString();
    const { shipping_address_id, billing_address_id, business_name } = req.body;

    if (!shipping_address_id) {
      return res.status(400).json({ message: "Shipping address is required" });
    }
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(
        `
    quantity,
    product_id,
    products ( id, title )
  `
      )
      .eq("user_id", userId);
    console.log("Cart Items found for checkout:", cartItems?.length);
    if (cartError || !cartItems?.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    const subtotal = cartItems.reduce((acc, item) => {
      const price = Number(item.products?.price || 0);
      return acc + price * item.quantity;
    }, 0);

    const totalAmount = subtotal;
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: userId,
          shipping_address_id,
          billing_address_id: billing_address_id || shipping_address_id,
          business_name: business_name || null,
          total_amount: totalAmount,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;
    const orderItemsData = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: Number(item.products?.price || 0),
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsData);

    if (itemsError) {
      throw itemsError;
    }
    await supabase.from("cart_items").delete().eq("user_id", userId);

    res.status(201).json({
      message: "Order placed successfully! 📦",
      orderId: order.id.toString(),
    });
  } catch (err) {
    console.error("Checkout Error Detail:", err);
    res.status(500).json({
      message: "Internal server error during checkout",
      error: err.message,
    });
  }
};
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        status,
        total_amount,
        created_at,
        business_name,
        shipping_address:addresses!shipping_address_id (*),
        billing_address:addresses!billing_address_id (*),
        order_items (
          quantity,
          price_at_time,
          products ( title, url )
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json({ data });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: err.message });
  }
};

const fetchPaymentHistory = async (req, res) => {
  const user_id = req.user.id;

  const { data, error } = await supabase
    .from("payment_history")
    .select(
      `id, amount, transaction_id, status, created_at, order_id, orders(id, status)`
    )
    .eq("user_id", user_id);
  console.log(data);
  if (error) return res.status(400).json({ error: error.message });

  console.log("Found Payments:", data);
  // Check your terminal for this!
  res.status(200).json({ data: data || [] }); // Ensure data is at least an empty array
};
module.exports = { checkout, getUserOrders, fetchPaymentHistory };
