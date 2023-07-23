const userSchema = require("./UserSchema");
const jwt = require("jsonwebtoken");
const secretKey = "My_SECRET_KEY";

const decodeToken = (token) => {
  let id;
  try {
    id = jwt.verify(token, secretKey);
    return id;
  } catch (err) {
    console.log("Error verifying token", err);
  }
};

const authenticateUserMiddleware = async (req, res, next) => {
  try {
  let token = req.headers.authorization;

  if (!token) {
    res.status(400).json({
      status: false,
      message: "Token not found",
    });
    return;
  }
  token = token.slice(0, token.length);
  const userId = decodeToken(token);

  if (!userId) {
    res.status(422).json({
      status: false,
      message: "Invalid Token",
    });
    return;
  }

  const user = await userSchema.findById({ _id: userId.id }).select("-password");
  if (!user) {
    res.status(422).json({
      status: false,
      message: "Invalid Token",
    });
    return;
  }
  req.user = user;
  next();
} catch (err) {
  res.status(400).json({ message: "Error authenticate user", error: err });
}
};

module.exports = {
  authenticateUserMiddleware,
};
