const {Router} = require("express")
const router = Router();
const multer = require('multer')
const path = require('path')
const Blog = require('../models/blog'); // Import the Blog model

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/uploads/`))
    },
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null,fileName)
    }
  })
  
  const upload = multer({ storage: storage })

router.get('/add-new',(req,res)=>{
    return res.render('addBlog',{
        user:req.user,
    })
});

router.post('/',upload.single('coverImage'), async (req,res)=>{
   // console.log(req.body)
   // console.log(req.file)

   try {
      const { title, body } = req.body;

      // Create new blog entry
      const blog = await Blog.create({
         title,
         body,
         coverImageURL: `/uploads/${req.file.filename}`,
         createdBy: req.user._id, // Assuming req.user contains the logged-in user's ID
      });

      // Redirect to homepage or blog detail page
      return res.redirect('/'); // You might want to redirect to a specific blog page later

   } catch (error) {
      console.error("Error creating blog:", error);
      // Render the add blog page again with an error message
      // You might need to fetch user data again if your addBlog.ejs requires it
      return res.render('addBlog', { 
         error: error.message || "Failed to create blog.",
         user: req.user, // Pass user data back to the template
       });
   }
});

module.exports = router;