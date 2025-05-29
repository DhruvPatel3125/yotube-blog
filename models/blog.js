const { Schema ,model} = require("mongoose");
const { on } = require("./user");


const blogSchema = new Schema({
    title:{
        type:String,
        require:true,
    },
    body:{
        type:String,
        require:false,
    },
    coverImageURL:{
        type:String,
        require:false,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
    }
},
    {timestamps:true}
)
const Blog = model('blog',blogSchema)
module.exports = Blog