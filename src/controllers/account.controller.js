const { supabase } = require("../lib/supabase");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, businessName, phone } = req.body;
    const userId = BigInt(req.user.id);

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        first_name: firstName,
        last_name: lastName,
        business_name: businessName,
        phone: phone,
      },
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id.toString(),
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        businessName: updatedUser.business_name,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
const addSubAccount = async (req, res) => {
  try {
    const { email, password, firstName, lastName, can_place_order } = req.body;
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Owner session not found" });
    }
    const ownerId = req.user.id;
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert([
        {
          email,
          password_hash: hashedPassword,
          first_name: firstName,
          last_name: lastName,
          role: "SUBACCOUNT",
        },
      ])
      .select()
      .single();
    if (userError) {
      console.error("Supabase User Error:", userError);
      return res
        .status(400)
        .json({ message: "Could not create user account", error: userError });
    }
    const { error: subError } = await supabase.from("sub_accounts").insert([
      {
        user_id: newUser.id,
        parent_id: ownerId,
        permissions: { can_place_order: true },
      },
    ]);
    if (subError) {
      console.error("Supabase SubAccount Error:", subError);
      await supabase.from("users").delete().eq("id", newUser.id);
      return res.status(400).json({
        message: "Could not link sub-account to owner",
        error: subError,
      });
    }
    res.status(201).json({ message: "Subaccount created successfully" });
  } catch (error) {
    console.error("General Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMySubAccounts = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { data, error } = await supabase
      .from("sub_accounts")
      .select(
        `
        id,
        permissions,
        users:user_id (
          id,
          email,
          first_name,
          last_name,
          created_at
        )
      `,
      )
      .eq("parent_id", ownerId);
    if (error) throw error;
    res.status(200).json({ data });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching sub-accounts", error: err.message });
  }
};

const updateSubAccountPermission = async (req, res) => {
  try {
    const { subAccountId, canPlaceOrder } = req.body;
    const ownerId = req.user.id;
    const { data, error } = await supabase
      .from("sub_accounts")
      .update({
        permissions: { can_place_order: canPlaceOrder },
      })
      .match({ id: subAccountId, parent_id: ownerId })
      .select();
    if (error) throw error;
    res.json({ message: "Permissions updated", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getMyCreditHistory = async (req, res) => {
  try {
    // req.user.id is populated by your JWT middleware
    const userId = req.user.id;
    const { data, error } = await supabase
      .from("credit_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Credit History Error:", error);
    res.status(500).json({ message: "Failed to fetch credit history" });
  }
};
module.exports = {
  updateProfile,
  getMySubAccounts,
  updateSubAccountPermission,
  addSubAccount,
  getMyCreditHistory,
};
