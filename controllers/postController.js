const Post = require('../models/Post');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, description, neighborhood, latitude, longitude, tags, privacy } = req.body;
    
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Create new post
    const newPost = new Post({
      title,
      description,
      imageUrl: `/uploads/posts/${req.file.filename}`,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      neighborhood,
      author: req.user.id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      privacy: privacy || 'public',
    });

    const savedPost = await newPost.save();
    
    // Populate author details
    const populatedPost = await Post.findById(savedPost._id).populate('author', 'username email profilePicture');

    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    // Filter by privacy setting - only show public posts or posts by the current user
    const filter = req.user ? 
      { 
        $or: [
          { privacy: 'public' },
          { author: req.user.id }
        ] 
      } : 
      { privacy: 'public' };
    
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate('author', 'username email profilePicture');
    
    // Format posts to match frontend expectations
    const formattedPosts = posts.map(post => ({
      id: post._id,
      title: post.title,
      description: post.description,
      image: post.imageUrl,
      neighborhood: post.neighborhood,
      author: post.author.username,
      date: post.createdAt,
      location: {
        lat: post.location.coordinates[1],
        lng: post.location.coordinates[0]
      },
      tags: post.tags,
      likes: post.likes,
      comments: post.comments.map(comment => ({
        author: comment.author || (comment.user ? comment.user.username : 'Anonymous'),
        text: comment.text,
        date: comment.date
      }))
    }));
    
    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username email profilePicture')
      .populate('comments.user', 'username profilePicture');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user can access this post (public or owner)
    if (post.privacy !== 'public' && (!req.user || post.author._id.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this post' });
    }
    
    // Format post to match frontend expectations
    const formattedPost = {
      id: post._id,
      title: post.title,
      description: post.description,
      image: post.imageUrl,
      neighborhood: post.neighborhood,
      author: post.author.username,
      date: post.createdAt,
      location: {
        lat: post.location.coordinates[1],
        lng: post.location.coordinates[0]
      },
      tags: post.tags,
      likes: post.likes,
      comments: post.comments.map(comment => ({
        author: comment.author || (comment.user ? comment.user.username : 'Anonymous'),
        text: comment.text,
        date: comment.date
      }))
    };
    
    res.status(200).json(formattedPost);
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const { title, description, neighborhood, latitude, longitude, tags, privacy } = req.body;
    
    // Find post
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }
    
    // Update post fields
    post.title = title || post.title;
    post.description = description || post.description;
    post.neighborhood = neighborhood || post.neighborhood;
    post.privacy = privacy || post.privacy;
    
    // Update location if both latitude and longitude are provided
    if (latitude && longitude) {
      post.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }
    
    // Update tags if provided
    if (tags) {
      post.tags = tags.split(',').map(tag => tag.trim());
    }
    
    // Update image if a new one is uploaded
    if (req.file) {
      // Delete old image
      const oldImagePath = path.join(__dirname, '..', post.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      
      // Set new image
      post.imageUrl = `/uploads/posts/${req.file.filename}`;
    }
    
    const updatedPost = await post.save();
    
    res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost,
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is the author or an admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    // Delete image file
    const imagePath = path.join(__dirname, '..', post.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    await post.deleteOne();
    
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get posts by location (within a radius)
exports.getPostsByLocation = async (req, res) => {
  try {
    const { longitude, latitude, radius = 10000 } = req.query; // radius in meters, default 10km
    
    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }
    
    // Filter by privacy setting - only show public posts or posts by the current user
    const filter = req.user ? 
      { 
        $or: [
          { privacy: 'public' },
          { author: req.user.id }
        ],
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: parseInt(radius),
          },
        }
      } : 
      { 
        privacy: 'public',
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: parseInt(radius),
          },
        }
      };
    
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate('author', 'username email profilePicture');
    
    // Format posts to match frontend expectations
    const formattedPosts = posts.map(post => ({
      id: post._id,
      title: post.title,
      description: post.description,
      image: post.imageUrl,
      neighborhood: post.neighborhood,
      author: post.author.username,
      date: post.createdAt,
      location: {
        lat: post.location.coordinates[1],
        lng: post.location.coordinates[0]
      },
      tags: post.tags,
      likes: post.likes,
      comments: post.comments.map(comment => ({
        author: comment.author || (comment.user ? comment.user.username : 'Anonymous'),
        text: comment.text,
        date: comment.date
      }))
    }));
    
    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error('Get posts by location error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get posts by neighborhood
exports.getPostsByNeighborhood = async (req, res) => {
  try {
    const { neighborhood } = req.params;
    
    if (!neighborhood) {
      return res.status(400).json({ message: 'Neighborhood is required' });
    }
    
    // Filter by privacy setting - only show public posts or posts by the current user
    const filter = req.user ? 
      { 
        $or: [
          { privacy: 'public' },
          { author: req.user.id }
        ],
        neighborhood: { $regex: new RegExp(neighborhood, 'i') }
      } : 
      { 
        privacy: 'public',
        neighborhood: { $regex: new RegExp(neighborhood, 'i') }
      };
    
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate('author', 'username email profilePicture');
    
    // Format posts to match frontend expectations
    const formattedPosts = posts.map(post => ({
      id: post._id,
      title: post.title,
      description: post.description,
      image: post.imageUrl,
      neighborhood: post.neighborhood,
      author: post.author.username,
      date: post.createdAt,
      location: {
        lat: post.location.coordinates[1],
        lng: post.location.coordinates[0]
      },
      tags: post.tags,
      likes: post.likes,
      comments: post.comments.map(comment => ({
        author: comment.author || (comment.user ? comment.user.username : 'Anonymous'),
        text: comment.text,
        date: comment.date
      }))
    }));
    
    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error('Get posts by neighborhood error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add comment to post
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Get user info for the comment
    const user = await User.findById(req.user.id).select('username');
    
    const newComment = {
      user: req.user.id,
      author: user.username,
      text,
    };
    
    post.comments.unshift(newComment);
    await post.save();
    
    // Format comments to match frontend expectations
    const formattedComments = post.comments.map(comment => ({
      author: comment.author || 'Anonymous',
      text: comment.text,
      date: comment.date
    }));
    
    res.status(201).json({
      message: 'Comment added successfully',
      comments: formattedComments,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Increment likes
    post.likes += 1;
    await post.save();
    
    res.status(200).json({
      message: 'Post liked successfully',
      likes: post.likes
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
