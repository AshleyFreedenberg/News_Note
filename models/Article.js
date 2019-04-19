const mongoose = require("mongoose");
const Schema = mongoose.Schema; 

const articleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    url: {
        type: String,
        unique: true,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    saved: {
        type: Boolean,
        default: false
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
});

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;