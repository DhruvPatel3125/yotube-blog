const {Router} = require("express")
const router = Router();
const multer = require('multer')
const path = require('path')
const Blog = require('../models/blog'); // Import the Blog model
const Comment = require('../models/comment'); // Import the Blog model
const fs = require('fs');

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

router.get("/:id",async (req,res)=>{
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
})

router.post('/comment/:blogId', async(req, res) => {
   try {
      const comment = await Comment.create({
         content: req.body.content,
         blogId: req.params.blogId,
         createdBy: req.user._id
      });
      return res.redirect(`/blog/${req.params.blogId}`);
   } catch (error) {
      console.error("Error creating comment:", error);
      return res.render('addBlog', { 
         error: error.message || "Failed to create comment.",
         user: req.user,
      });
   }
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

router.get('/edit/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).render('error', { error: 'Blog not found.' });
        }

        // Check if the logged-in user is the creator of the blog
        if (!req.user || (blog.createdBy && req.user._id.toString() !== blog.createdBy.toString())) {
            return res.status(403).render('error', { error: 'You are not authorized to edit this blog post.' });
        }

        return res.render('editBlog', {
            user: req.user,
            blog,
        });
    } catch (error) {
        console.error("Error fetching blog for edit:", error);
        return res.status(500).render('error', { error: 'Failed to load blog for editing.' });
    }
});

router.post('/:id', upload.single('coverImage'), async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).render('error', { error: 'Blog not found.' });
        }

        // Check if the logged-in user is the creator of the blog
        if (!req.user || (blog.createdBy && req.user._id.toString() !== blog.createdBy.toString())) {
            return res.status(403).render('error', { error: 'You are not authorized to edit this blog post.' });
        }

        const { title, body } = req.body;
        const updateData = { title, body };

        if (req.file) {
            // Delete old cover image if it exists and is not the default
            if (blog.coverImageURL && !blog.coverImageURL.includes('default.jpg')) {
                const oldImagePath = path.resolve('./public' + blog.coverImageURL);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateData.coverImageURL = `/uploads/${req.file.filename}`;
        }

        await Blog.findByIdAndUpdate(req.params.id, updateData);

        return res.redirect(`/blog/${req.params.id}`);

    } catch (error) {
        console.error("Error updating blog:", error);
        return res.render('editBlog', {
            error: error.message || "Failed to update blog.",
            user: req.user,
            blog: { _id: req.params.id, title: req.body.title, body: req.body.body }, // Pass partial data back to retain form values
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).render('error', { error: 'Blog not found.' });
        }

        // Check if the logged-in user is the creator of the blog
        if (!req.user || (blog.createdBy && req.user._id.toString() !== blog.createdBy.toString())) {
            return res.status(403).render('error', { error: 'You are not authorized to delete this blog post.' });
        }

        // Delete cover image if it exists and is not the default
        if (blog.coverImageURL && !blog.coverImageURL.includes('default.jpg')) {
            const imagePath = path.resolve('./public' + blog.coverImageURL);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Blog.findByIdAndDelete(req.params.id);
        await Comment.deleteMany({ blogId: req.params.id }); // Delete associated comments

        return res.redirect('/');

    } catch (error) {
        console.error("Error deleting blog:", error);
        return res.status(500).render('error', { error: 'Failed to delete blog post.' });
    }
});

module.exports = router;