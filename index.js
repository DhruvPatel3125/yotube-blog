const express = require("express");
const app = express();
const userRoute = require("./routes/user");
const mongoose = require("mongoose");


const path = require("path");
const PORT = 8000;

mongoose.connect("mongodb://localhost:27017/blogify").then((e) => {
  console.log("Connected to MongoDB");
})

app.set('view engine','ejs');
app.set("views",path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/", (req, res) => {
    res.render("home")
})

app.use("/user", userRoute);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});