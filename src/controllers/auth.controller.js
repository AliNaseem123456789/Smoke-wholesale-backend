const { supabase } = require("../lib/supabase");
const bcrypt = require("bcrypt");
const { generateAccessToken } = require("../jwt");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    let permissions = null;
    if (user.role === "SUBACCOUNT") {
      const { data: subData } = await supabase
        .from("sub_accounts")
        .select("permissions")
        .eq("user_id", user.id)
        .single();

      permissions = subData?.permissions;
    }

    const accessToken = generateAccessToken(user);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id.toString(),
        email: user.email,
        role: user.role,
        permissions,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error: createError } = await supabase
      .from("users")
      .insert([
        {
          email,
          password_hash: hashedPassword,
          role: "USER",
        },
      ])
      .select()
      .single();

    if (createError) throw createError;

    const token = generateAccessToken(user);
    res.cookie("accessToken", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id.toString(),
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const me = async (req, res) => {
  try {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (userError || !user)
      return res.status(404).json({ error: "User not found" });

    let permissions = null;
    if (user.role === "SUBACCOUNT") {
      const { data: subData } = await supabase
        .from("sub_accounts")
        .select("permissions")
        .eq("user_id", user.id)
        .single();

      permissions = subData?.permissions;
    }

    res.status(200).json({
      user: {
        id: user.id.toString(),
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        businessName: user.business_name,
        phone: user.phone,
        permissions,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { login, register, me, logout };
