require('dotenv').config();
const express = require("express");
const app = express();
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const mongoose = require("mongoose");
const cookiePaser = require('cookie-parser')


const path = require("path");
const fs = require('fs'); // Import the file system module
const { checkForAuthenticationCookie } = require("./middleware/authentication");
const Blog = require('./models/blog'); // Import the Blog model
const { env, config } = require("process");
const PORT = process.env.PORT||8000;
app.use(express.static(path.resolve("./public")))

// Ensure the uploads directory exists
const uploadDir = path.resolve('./public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Create the directory if it doesn't exist
}


mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});


app.set('view engine','ejs');
app.set("views",path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookiePaser())
app.use(checkForAuthenticationCookie("token"))

app.get("/", async (req, res) => {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.render("home",{
      user:req.user,
      blogs: blogs,
    });

})

app.use("/user", userRoute);
app.use("/blog", blogRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", { error: err.message }); // Assuming you have an error.ejs view
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});