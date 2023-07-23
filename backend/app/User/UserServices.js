const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = require("./UserSchema");
const secretKey = "My_SECRET_KEY";

const generateToken = (id) => {
  const token = jwt.sign(
    {
      id,
    },
    secretKey
  );
  return token;
};

const verifyEmail = (email) => {
  const pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;

  return pattern.test(email);
};

const signupUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({
      status: false,
      message: `All fields are required`,
    });
    return;
  }
  if (!verifyEmail(email)) {
    res.status(400).json({
      status: false,
      message: `Email is not valid`,
    });
    return;
  }

  const isAlreadyExist = await userSchema.findOne({ email });
    if (isAlreadyExist) {
      res.status(400).json({ message: "User already exist" });
      return;
    }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new userSchema({
    name,
    email,
    password: hashedPassword,
  });

  newUser
    .save()
    .then((user) => {
      res.status(201).json({
        status: true,
        message: "User successfully created",
        data: user,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: "Error creating user",
        error: err,
      });
    });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      status: false,
      message: `All fields are required`,
    });
    return;
  }
  if (!verifyEmail(email)) {
    res.status(400).json({
      status: false,
      message: `Email is not valid`,
    });
    return;
  }

  const user = await userSchema.findOne({ email });
  if (!user) {
    res.status(422).json({
      status: false,
      message: `Email is not present in our database`,
    });
    return;
  }

  const dbPassword = user.password;
  const matched = await bcrypt.compare(password, dbPassword);

  if (!matched) {
    res.status(422).json({
      status: false,
      message: `Credentials does not match`,
    });
    return;
  }
  const token = generateToken(user._id);
  res.status(200).json({
    status: true,
    message: "Login successful",
    data: {
      user,
      token
    }
  });
};

module.exports = {
  signupUser,
  loginUser
};
