const { Router } = require("express");
const router = Router();
const User = require("../models/user");

router.get("/signin", (req, res) => {
  return res.render("signin");
});
router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signin", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    if (!token) {
      return res.redirect("/signin");
    }
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    next(error);
  }
});

router.post("/signup", async (req, res, next) => {
  const { fullname, email, password } = req.body;
  try {
    await User.create({
      fullName: fullname,
      email,
      password,
    });
    return res.redirect("/");
  } catch (error) {
    console.error("Error creating user:", error);
    if (res.headersSent) {
      return next(error);
    } else {
      return res.render("signup", { error: error.message || "Failed to create user." });
    }
  }
});

router.get("/logout",(req,res)=>{
    res.clearCookie('token').redirect("/")
})

module.exports = router;
