const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const Blog = mongoose.model('Blog');

const AWS = require('aws-sdk');
const keys = require('../config/keys');
const s3 = new AWS.S3({
    accessKeyId: keys.accessKeyId,
    secretAccessKey: keys.secretAccessKey
})

const cleanCache = require('../middlewares/cleanCache');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });
    s3.getSignedUrl('getObject', {
        Bucket: 'hippensteele-blog',
        Key: blog.imageUrl,
        Expires: 60
    }, (err, url) => {
      if (err){
        return res.status(400).send(err);
      };
      blog.imageUrl = url;
      res.send(blog);
    }); 
  });

  app.get('/api/blogs', requireLogin, cleanCache, async (req, res) => {
    const blogs = await Blog.find({ _user: req.user.id }).cache({key: req.user.id});
    res.send(blogs);
  });

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content, imageUrl } = req.body;

    const blog = new Blog({
      title,
      content,
      imageUrl,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
