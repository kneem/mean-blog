// Schema definition and model for blogs.

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// child
var blogPostsSchema = new Schema({
    title: String,
    body: String,
    date: {
        type: Date,
        default: Date.now
    },
    image: String
});

// parent
var blogsSchema = new Schema({
    title: String,
    posts: [blogPostsSchema]
});

mongoose.model('blogs', blogsSchema);
