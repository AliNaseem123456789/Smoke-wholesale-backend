const { supabase } = require("../lib/supabase");

const fetchUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });

    if (error) {
      return res.status(500).json({
        message: "Supabase error",
        error: error.message,
      });
    }
    const formattedData = data.map((addr) => ({
      ...addr,
      id: addr.id.toString(),
      user_id: addr.user_id.toString(),
    }));

    res.json({
      message: "Addresses fetched ",
      data: formattedData,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
const addUserAddress = async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const {
      full_name,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      phone,
      address_type,
      is_default,
    } = req.body;

    if (is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);
    }
    const { data, error } = await supabase
      .from("addresses")
      .insert([
        {
          user_id: userId,
          full_name,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          country: country || "USA",
          phone,
          address_type: address_type?.toLowerCase() || "shipping",
          is_default: !!is_default,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Address added successfully",
      data: { ...data, id: data.id.toString() },
    });
  } catch (err) {
    console.error("Add Address Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return res
        .status(500)
        .json({ message: "Supabase error", error: error.message });
    }

    res.json({ message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId);
    const { data, error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: "Default address updated ✅", data });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  fetchUserAddresses,
  addUserAddress,
  deleteAddress,
  setDefaultAddress,
};
