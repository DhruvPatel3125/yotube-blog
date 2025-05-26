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
    const {email,password} = req.body;
    const token = await User.matchPasswordAndGenerateToken(email,password);
    if(!token){
        return res.redirect('/signin');
        console.log(token)
    }
    res.cookie('token', token);
    return res.redirect('/');
    console.log(token)
})

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