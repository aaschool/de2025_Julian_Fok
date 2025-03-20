const User = require('../models/User');
const Post = require('../models/Post');
const fs = require('fs');
const path = require('path');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's posts
    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate('author', 'username email profilePicture');
    
    res.status(200).json({
      user,
      posts,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, bio } = req.body;
    
    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if username is taken (if changing username)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = username;
    }
    
    // Check if email is taken (if changing email)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      user.email = email;
    }
    
    // Update bio
    if (bio !== undefined) {
      user.bio = bio;
    }
    
    // Update profile picture if uploaded
    if (req.file) {
      // Delete old profile picture if it exists
      if (user.profilePicture) {
        const oldPicturePath = path.join(__dirname, '..', user.profilePicture);
        if (fs.existsSync(oldPicturePath) && !user.profilePicture.includes('default')) {
          fs.unlinkSync(oldPicturePath);
        }
      }
      
      // Set new profile picture
      user.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }
    
    const updatedUser = await user.save();
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profilePicture,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all contributors
exports.getContributors = async (req, res) => {
  try {
    const contributors = await User.find({ role: 'contributor' })
      .select('username email profilePicture bio')
      .sort({ username: 1 });
    
    res.status(200).json(contributors);
  } catch (error) {
    console.error('Get contributors error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
