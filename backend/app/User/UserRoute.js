const express = require("express");

const { signupUser } = require("./UserServices");
const { loginUser } = require("./UserServices");

const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);

module.exports = router;
