var fs = require('fs'),
    config = require('./config'),
    async = require('async'),
    mongoose = require('mongoose'),
    uuid = require('node-uuid'),
    multiparty = require('multiparty');

module.exports = function(app) {

    //Home route
    var index = require('../app/controllers/index');

    app.get('/', index.render);

    var Blogs = mongoose.model('blogs');

    // GET - fetch all blogs
    app.get('/api/blogs', function(req, res) {
        Blogs.find(function(err, blogs) {
            res.json(blogs);
        });
    });

    // POST - create a new blog
    app.post('/api/blogs', function(req, res) {
        if (!req.body.title) {
            res.status(400).send('Error: New blog must have a title.');
        }

        Blogs.create({title: req.body.title}, function(err, blog) {
            if (err) {
                res.status(400).send(err);
            }
            res.json(blog);
        });
    });

    // GET - fetch a certain blog
    app.get('/api/blogs/:id', function(req, res) {
        Blogs.findById(req.params.id, function(err, blog) {
            if (err) {
                res.status(400).send(err);
            }
            res.json(blog);
        });
    });

    // GET - fetch all blog posts for a certain blog
    app.get('/api/blogs/:id/posts', function(req, res) {
        Blogs.findById(req.params.id, function(err, blog) {
            if (err) {
                res.status(400).send(err);
            }
            res.json(blog.posts);
        });
    });

    // POST - create a blog post for a certain blog
    app.post('/api/blogs/:id/posts', function(req, res) {
        var pushPost = function(img) {
            Blogs.findById(req.params.id, function(err, blog) {
                if (err) {
                    res.status(400).send(err);
                }

                if (img) {
                    req.body.image = img;
                }
                // push returns the new length of the posts array
                var idx = blog.posts.push(req.body) - 1;

                blog.save(function(err, blog) {
                    if (err) {
                        res.status(400).send(err);
                    }
                    return res.json(blog.posts[idx]);
                });
            });
        };

        var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                fields = fields || {};
                var title = req.body.title || fields.title && fields.title[0],
                    body = req.body.body || fields.body && fields.body[0];

                if (!title || body.length > 160) {
                    res.status(400).send('Error. Blog post must have a title, and the post is limited to 160 characters.');
                    return;
                }
                req.body.title = title;
                req.body.body = body;

                if (files) {
                    var file = files.file[0],
                        contentType = file.headers['content-type'],
                        tmpPath = file.path,
                        extIndex = tmpPath.lastIndexOf('.'),
                        ext = (extIndex < 0) ? '' : tmpPath.substr(extIndex),
                        fileName = uuid.v4() + ext,
                        destPath = config.root + '/public/uploads/' + fileName;

                    switch (contentType) {
                        case 'image/png':
                        case 'image/jpeg':
                        case 'image/gif':
                            break;
                        default:
                            fs.unlink(tmpPath);
                            return res.status(415).send('Unsupported file type.');
                    }

                    fs.rename(tmpPath, destPath, function(err) {
                        if (err) {
                            return res.status(400).send('Image is not saved:' + err);
                        }
                        pushPost(fileName);
                    });
                } else {
                    pushPost();
                }
            });
    });

    // GET - fetch a certain blog post from a blog
    app.get('/api/blogs/:blogId/posts/:postId', function(req, res) {
        Blogs.findById(req.params.blogId, function(err, blog) {
            if (err) {
                res.status(400).send(err);
            }
            var post = blog.posts.id(req.params.postId);
            res.json(post);
        });
    });

    // DELETE - Remove a certain blog post from a blog
    app.delete('/api/blogs/:blogId/posts/:postId', function(req, res) {
        Blogs.findById(req.params.blogId, function(err, blog) {
            if (err) {
                res.status(400).send(err);
            }
            blog.posts.id(req.params.postId).remove();
            blog.save(function(err, blog) {
                if (err) {
                    res.status(400).send(err);
                }
                res.json(blog);
            });
        });
    });
};
