// API Service for Neighborhood Stories App

const API = {
  baseUrl: 'http://localhost:8080/api',
  
  // Authentication API
  auth: {
    // Register a new user
    register: async (userData) => {
      try {
        const response = await fetch(`${API.baseUrl}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }
        
        // Store token in localStorage
        localStorage.setItem('authToken', data.token);
        
        return data;
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },
    
    // Login user
    login: async (credentials) => {
      try {
        const response = await fetch(`${API.baseUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }
        
        // Store token in localStorage
        localStorage.setItem('authToken', data.token);
        
        return data;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    
    // Guest login
    guestLogin: async () => {
      try {
        const response = await fetch(`${API.baseUrl}/auth/guest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Guest login failed');
        }
        
        // Store token in localStorage
        localStorage.setItem('authToken', data.token);
        
        return data;
      } catch (error) {
        console.error('Guest login error:', error);
        throw error;
      }
    },
    
    // Logout user
    logout: () => {
      localStorage.removeItem('authToken');
    },
    
    // Get current user
    getCurrentUser: async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await fetch(`${API.baseUrl}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to get user data');
        }
        
        return data.user;
      } catch (error) {
        console.error('Get current user error:', error);
        throw error;
      }
    },
    
    // Check if user is authenticated
    isAuthenticated: () => {
      return localStorage.getItem('authToken') !== null;
    }
  },
  
  // Posts API
  posts: {
    // Create a new post
    createPost: async (postData) => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const formData = new FormData();
        
        // Append post data to form data
        formData.append('title', postData.title);
        formData.append('description', postData.description);
        formData.append('neighborhood', postData.neighborhood);
        
        if (postData.tags && postData.tags.length > 0) {
          formData.append('tags', JSON.stringify(postData.tags));
        }
        
        if (postData.location) {
          formData.append('location', JSON.stringify(postData.location));
        }
        
        if (postData.privacy) {
          formData.append('privacy', postData.privacy);
        }
        
        if (postData.image) {
          formData.append('image', postData.image);
        }
        
        const response = await fetch(`${API.baseUrl}/posts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to create post');
        }
        
        return data.post;
      } catch (error) {
        console.error('Create post error:', error);
        throw error;
      }
    },
    
    // Get all posts
    getAllPosts: async () => {
      try {
        const response = await fetch(`${API.baseUrl}/posts`);
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to get posts');
        }
        
        return data.posts;
      } catch (error) {
        console.error('Get all posts error:', error);
        throw error;
      }
    },
    
    // Get posts by neighborhood
    getPostsByNeighborhood: async (neighborhood) => {
      try {
        const response = await fetch(`${API.baseUrl}/posts/neighborhood/${encodeURIComponent(neighborhood)}`);
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to get posts by neighborhood');
        }
        
        return data.posts;
      } catch (error) {
        console.error('Get posts by neighborhood error:', error);
        throw error;
      }
    },
    
    // Get posts by location
    getPostsByLocation: async (lat, lng, radius) => {
      try {
        const response = await fetch(`${API.baseUrl}/posts/location?lat=${lat}&lng=${lng}&radius=${radius}`);
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to get posts by location');
        }
        
        return data.posts;
      } catch (error) {
        console.error('Get posts by location error:', error);
        throw error;
      }
    },
    
    // Get post by ID
    getPostById: async (postId) => {
      try {
        const response = await fetch(`${API.baseUrl}/posts/${postId}`);
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to get post');
        }
        
        return data.post;
      } catch (error) {
        console.error('Get post by ID error:', error);
        throw error;
      }
    },
    
    // Update post
    updatePost: async (postId, postData) => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const formData = new FormData();
        
        // Append post data to form data
        if (postData.title) formData.append('title', postData.title);
        if (postData.description) formData.append('description', postData.description);
        if (postData.neighborhood) formData.append('neighborhood', postData.neighborhood);
        
        if (postData.tags && postData.tags.length > 0) {
          formData.append('tags', JSON.stringify(postData.tags));
        }
        
        if (postData.location) {
          formData.append('location', JSON.stringify(postData.location));
        }
        
        if (postData.privacy) {
          formData.append('privacy', postData.privacy);
        }
        
        if (postData.image) {
          formData.append('image', postData.image);
        }
        
        const response = await fetch(`${API.baseUrl}/posts/${postId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to update post');
        }
        
        return data.post;
      } catch (error) {
        console.error('Update post error:', error);
        throw error;
      }
    },
    
    // Delete post
    deletePost: async (postId) => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await fetch(`${API.baseUrl}/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete post');
        }
        
        return data;
      } catch (error) {
        console.error('Delete post error:', error);
        throw error;
      }
    },
    
    // Like post
    likePost: async (postId) => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await fetch(`${API.baseUrl}/posts/${postId}/like`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to like post');
        }
        
        return data;
      } catch (error) {
        console.error('Like post error:', error);
        throw error;
      }
    },
    
    // Add comment to post
    addComment: async (postId, commentText) => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await fetch(`${API.baseUrl}/posts/${postId}/comment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: commentText })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to add comment');
        }
        
        return data;
      } catch (error) {
        console.error('Add comment error:', error);
        throw error;
      }
    },
    
    // Search posts
    searchPosts: async (query) => {
      try {
        const response = await fetch(`${API.baseUrl}/posts/search?q=${encodeURIComponent(query)}`);
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to search posts');
        }
        
        return data.posts;
      } catch (error) {
        console.error('Search posts error:', error);
        throw error;
      }
    }
  },
  
  // User profile API
  profile: {
    // Get user profile
    getProfile: async (userId) => {
      try {
        const response = await fetch(`${API.baseUrl}/users/${userId}`);
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to get user profile');
        }
        
        return data.user;
      } catch (error) {
        console.error('Get profile error:', error);
        throw error;
      }
    },
    
    // Update user profile
    updateProfile: async (profileData) => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const formData = new FormData();
        
        // Append profile data to form data
        if (profileData.username) formData.append('username', profileData.username);
        if (profileData.bio) formData.append('bio', profileData.bio);
        if (profileData.neighborhood) formData.append('neighborhood', profileData.neighborhood);
        
        if (profileData.avatar) {
          formData.append('avatar', profileData.avatar);
        }
        
        const response = await fetch(`${API.baseUrl}/users/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to update profile');
        }
        
        return data.user;
      } catch (error) {
        console.error('Update profile error:', error);
        throw error;
      }
    },
    
    // Get user posts
    getUserPosts: async (userId) => {
      try {
        const response = await fetch(`${API.baseUrl}/users/${userId}/posts`);
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to get user posts');
        }
        
        return data.posts;
      } catch (error) {
        console.error('Get user posts error:', error);
        throw error;
      }
    }
  }
};

// Export API for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
