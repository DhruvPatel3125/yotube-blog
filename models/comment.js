const { Schema, model } = require("mongoose");

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    blogId: {
        type: Schema.Types.ObjectId,
        ref: "blog", // Reference to the Blog model
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user", // Reference to the User model
    },
},
    { timestamps: true }
);

const Comment = model('comment', commentSchema);

module.exports = Comment;