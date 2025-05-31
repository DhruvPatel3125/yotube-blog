const {Router} = require("express")
const router = Router();
const multer = require('multer')
const path = require('path')
const Blog = require('../models/blog'); // Import the Blog model
const Comment = require('../models/comment'); // Import the Blog model

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

router.get("/:id",async (req,res,next)=>{
   try {
      const blog = await Blog.findById(req.params.id).populate("createdBy");
      const comments = await Comment.find({blogId:req.params.id}).populate(
         "createdBy"
      )
      console.log("blog",blog)

      if (!blog) {
         return res.status(404).render("error", { error: "Blog not found." });
      }
      console.log("comments",comments)

      return res.render('partials/blog',{
         user:req.user,
         blog,
         comments,
      })
   } catch (error) {
      next(error);
   }
})

router.post('/comment/:blogId', async(req, res, next) => {
   try {
      const comment = await Comment.create({
         content: req.body.content,
         blogId: req.params.blogId,
         createdBy: req.user._id
      });
      return res.redirect(`/blog/${req.params.blogId}`);
   } catch (error) {
      console.error("Error creating comment:", error);
      return res.redirect(`/blog/${req.params.blogId}`);
   }
});

router.post('/',upload.single('coverImage'), async (req,res,next)=>{
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
      return res.redirect('/');
   }
});

module.exports = router;