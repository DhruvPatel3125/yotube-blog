const {Router} = require('express');
const router = Router();
const User = require('../models/user');

router.get('/signin',(req,res)=>{
    return res.render("signin");
})
router.get('/signup',(req,res)=>{
    return res.render("signup");
})
router.post('/signin',async(req,res)=>{
    const { fullName,email,password} = req.body;
    await User.create({
        fullName,
        email,
        password
    });
    return res.redirect('/');
});

router.post('/signup', async (req, res) => {
    const { fullname, email, password } = req.body;
    try {
        await User.create({
            fullName: fullname,
            email,
            password
        });
        return res.redirect('/');
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).send("Error during signup."); // Or render an error page
    }
});

module.exports = router;