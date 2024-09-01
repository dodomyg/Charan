const bcrypt = require("bcrypt");
const USER = require("../schema/USER");
const jwt = require("jsonwebtoken");
const redisClient = require("../utils/redis");

const generateToken = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN, {
    expiresIn: "3d",
  });

  return {
    accessToken,
    refreshToken,
  };
};

const storeRefreshToken = async (id, refreshToken) => {
  await redisClient.set(
    `refreshToken:${id}`,
    refreshToken,
    "EX",
    60 * 60 * 24 * 3 //3days
  );
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await USER.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash(password, salt);
    const user = new USER({
      name,
      email,
      password: hashedPw,
    });

    const { accessToken, refreshToken } = generateToken(user._id);

    await storeRefreshToken(user._id, refreshToken);

    //create cookie
    res.cookie("refreshToken", refreshToken, {
      http: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      http: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
    });
    await user.save();
    return res
      .status(200)
      .json({ message: "User registered successfully", user });
  } catch (error) {
    console.log("Error in register", error);
    return res.status(500).send("Internal Server Error");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await USER.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User does not exist with this email" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const { accessToken, refreshToken } = generateToken(user._id);
    await storeRefreshToken(user._id, refreshToken);
    //create cookie
    res.cookie("refreshToken", refreshToken, {
      http: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", accessToken, {
      http: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
    });
    return res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.log("Error in login", error);
    return res.status(500).send("Internal Server Error");
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).send("Unauthorized");
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    await redisClient.del(`refreshToken:${decoded?.userId}`);
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("Error in logout", error);
    return res.status(500).send("Internal Server Error");
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).send("No refresh token found");
    }
    const decoded = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    const storedRef = await redisClient.get(`refreshToken:${decoded?.userId}`);
    if (storedRef !== refreshToken) {
      return res.status(401).send("Invalid refresh token");
    }
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN,
      {
        expiresIn: "15m",
      }
    );
    res.cookie("accessToken", accessToken, {
      http: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
    });
    return res.status(200).json({ message: "Access token refreshed" });
  } catch (error) {
    console.log("Error in refreshAccessToken", error);
    return res.status(500).send("Internal Server Error");
  }
};

const getProfile = async (req, res) => {
  try {
  } catch (error) {
    console.log("Error in getProfile", error);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  getProfile
};
