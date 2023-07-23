const express = require("express");

const { signupUser } = require("./UserServices");
const { loginUser } = require("./UserServices");

const router = express.Router();

router.post("/user/signup", signupUser);
router.post("/user/login", loginUser);

module.exports = router;
