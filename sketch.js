// Global variables
let currentPage = 'home';
let map;
let locationPickerMap;
let modal;
let dummyData = [];
let currentUser = { id: 1, name: 'Guest User' }; // Simulated user for demo

// P5.js setup function
function setup() {
  // Create canvas that fills the main content area
  const mainContent = document.getElementById('main-content');
  const canvas = createCanvas(mainContent.offsetWidth, 0);
  canvas.parent('main-content');
  
  // Initialize modal for story details
  modal = createModal();
  
  // Generate dummy data
  generateDummyData();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize the home page
  showPage('home');
}

// P5.js draw function - main animation loop
function draw() {
  // Clear the canvas
  clear();
  
  // No continuous drawing needed for this app
  // We'll update the canvas only when necessary
  noLoop();
}

// Generate dummy data for the application
function generateDummyData() {
  const neighborhoods = ['Downtown', 'Riverside', 'Highland Park', 'Oakwood', 'Maple Grove'];
  const titles = [
    'Summer Festival 1985', 
    'The Old Corner Store', 
    'When the Bridge Was Built',
    'Neighborhood Park in the 70s',
    'Main Street Before Renovation',
    'The Historic Theater',
    'First Day of School 1992',
    'Winter Carnival 1980',
    'The Community Garden Project',
    'Old Train Station'
  ];
  
  for (let i = 0; i < 20; i++) {
    dummyData.push({
      id: i,
      title: titles[i % titles.length],
      neighborhood: neighborhoods[i % neighborhoods.length],
      description: 'This is a story about how our neighborhood used to look. Many memories were made here that shaped our community.',
      image: `https://picsum.photos/id/${(i + 10) * 5}/500/300`,
      author: 'Community Member',
      date: '2025-' + (Math.floor(i/4) + 1) + '-' + ((i % 28) + 1),
      location: {
        lat: 40.7128 + (Math.random() * 0.1 - 0.05),
        lng: -74.0060 + (Math.random() * 0.1 - 0.05)
      },
      tags: ['history', 'community', 'memories'],
      likes: Math.floor(Math.random() * 50),
      comments: [
        { author: 'Jane', text: 'I remember this place! My grandmother used to take me there.' },
        { author: 'Mike', text: 'Great photo, brings back so many memories.' }
      ]
    });
  }
}

// Set up event listeners for the application
function setupEventListeners() {
  // Navigation links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.target.getAttribute('data-page');
      showPage(page);
    });
  });
  
  // Search button
  document.getElementById('search-button').addEventListener('click', () => {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    if (searchTerm) {
      const filteredData = dummyData.filter(item => 
        item.title.toLowerCase().includes(searchTerm) || 
        item.neighborhood.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
      );
      showPage('gallery', filteredData);
    }
  });
  
  // Upload form submission
  document.getElementById('story-upload-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const title = document.getElementById('story-title').value;
    const content = document.getElementById('story-content').value;
    const neighborhood = document.getElementById('neighborhood').value;
    const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
    const privacy = document.getElementById('privacy').value;
    
    // Create new story object
    const newStory = {
      id: dummyData.length + 1,
      title: title,
      neighborhood: neighborhood,
      description: content,
      image: 'https://picsum.photos/id/' + Math.floor(Math.random() * 100) + '/500/300',
      author: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      location: {
        lat: parseFloat(document.getElementById('latitude').value) || 40.7128,
        lng: parseFloat(document.getElementById('longitude').value) || -74.0060
      },
      tags: tags,
      likes: 0,
      comments: []
    };
    
    // Add to dummy data
    dummyData.unshift(newStory);
    
    // Show success message and redirect to gallery
    alert('Your story has been successfully uploaded!');
    showPage('gallery');
  });
  
  // Photo upload preview
  document.getElementById('photo-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const previewContainer = document.getElementById('preview-container');
        previewContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = event.target.result;
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });
}

// Show the specified page
function showPage(pageName, customData = null) {
  currentPage = pageName;
  
  // Hide all content sections
  document.getElementById('main-content').style.display = 'block';
  document.getElementById('map-container').style.display = 'none';
  document.getElementById('upload-form').style.display = 'none';
  
  // Clear main content
  removeElements();
  
  // Show the appropriate page content
  switch(pageName) {
    case 'home':
      showHomePage();
      break;
    case 'gallery':
      showGalleryPage(customData);
      break;
    case 'map':
      showMapPage();
      break;
    case 'upload':
      showUploadPage();
      break;
  }
}

// Display the home page
function showHomePage() {
  const mainContent = document.getElementById('main-content');
  
  // Create welcome container
  const welcomeContainer = createElement('div');
  welcomeContainer.class('welcome-container');
  welcomeContainer.parent(mainContent);
  
  // Welcome heading
  const heading = createElement('h1', 'Welcome to Neighborhood Stories');
  heading.parent(welcomeContainer);
  
  // Welcome text
  const welcomeText = createElement('p', 'Discover and share the history of your neighborhood through photos and stories.');
  welcomeText.parent(welcomeContainer);
  
  // CTA buttons
  const ctaButtons = createElement('div');
  ctaButtons.class('cta-buttons');
  ctaButtons.parent(welcomeContainer);
  
  const exploreButton = createElement('button', 'Explore Stories');
  exploreButton.class('cta-button');
  exploreButton.mousePressed(() => showPage('gallery'));
  exploreButton.parent(ctaButtons);
  
  const uploadButton = createElement('button', 'Share Your Story');
  uploadButton.class('cta-button secondary');
  uploadButton.mousePressed(() => showPage('upload'));
  uploadButton.parent(ctaButtons);
  
  // Featured section
  const featuredSection = createElement('div');
  featuredSection.class('featured-section');
  featuredSection.parent(mainContent);
  
  const featuredHeading = createElement('h2', 'Featured Neighborhoods');
  featuredHeading.parent(featuredSection);
  
  // Featured neighborhoods grid
  const featuredGrid = createElement('div');
  featuredGrid.class('gallery-container');
  featuredGrid.parent(featuredSection);
  
  // Get unique neighborhoods
  const neighborhoods = [...new Set(dummyData.map(item => item.neighborhood))];
  
  // Create featured neighborhood cards
  neighborhoods.slice(0, 4).forEach(neighborhood => {
    const neighborhoodStories = dummyData.filter(item => item.neighborhood === neighborhood);
    
    const card = createElement('div');
    card.class('gallery-item');
    card.mousePressed(() => {
      showPage('gallery', neighborhoodStories);
    });
    card.parent(featuredGrid);
    
    const img = createImg(neighborhoodStories[0].image, neighborhood);
    img.class('gallery-item-img');
    img.parent(card);
    
    const info = createElement('div');
    info.class('gallery-item-info');
    info.parent(card);
    
    const title = createElement('h3', neighborhood);
    title.class('gallery-item-title');
    title.parent(info);
    
    const count = createElement('p', `${neighborhoodStories.length} stories`);
    count.class('gallery-item-neighborhood');
    count.parent(info);
  });
  
  // Recent stories section
  const recentSection = createElement('div');
  recentSection.class('featured-section');
  recentSection.parent(mainContent);
  
  const recentHeading = createElement('h2', 'Recent Stories');
  recentHeading.parent(recentSection);
  
  // Recent stories grid
  const recentGrid = createElement('div');
  recentGrid.class('gallery-container');
  recentGrid.parent(recentSection);
  
  // Create recent story cards
  dummyData.slice(0, 4).forEach(story => {
    createStoryCard(story, recentGrid);
  });
}

// Display the gallery page
function showGalleryPage(customData = null) {
  const mainContent = document.getElementById('main-content');
  const data = customData || dummyData;
  
  // Gallery heading
  const heading = createElement('h1', customData ? 'Filtered Results' : 'Story Gallery');
  heading.parent(mainContent);
  
  // Gallery container
  const galleryContainer = createElement('div');
  galleryContainer.class('gallery-container');
  galleryContainer.parent(mainContent);
  
  // Create story cards
  data.forEach(story => {
    createStoryCard(story, galleryContainer);
  });
}

// Display the map page
function showMapPage() {
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('map-container').style.display = 'block';
  
  // Initialize map if it doesn't exist yet
  if (!map) {
    map = L.map('map-container').setView([40.7128, -74.0060], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add markers for each story
    dummyData.forEach(story => {
      const marker = L.marker([story.location.lat, story.location.lng]).addTo(map);
      
      marker.bindPopup(`
        <div class="map-popup">
          <h3>${story.title}</h3>
          <p>${story.neighborhood}</p>
          <img src="${story.image}" alt="${story.title}" style="width:100%;max-width:200px;">
          <p>${story.description.substring(0, 100)}...</p>
          <button class="view-story-btn" data-id="${story.id}">View Story</button>
        </div>
      `);
      
      marker.on('popupopen', () => {
        document.querySelector(`.view-story-btn[data-id="${story.id}"]`).addEventListener('click', () => {
          showStoryDetail(story);
        });
      });
    });
  }
  
  // Refresh map size
  setTimeout(() => {
    map.invalidateSize();
  }, 100);
}

// Display the upload page
function showUploadPage() {
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('upload-form').style.display = 'block';
  
  // Initialize location picker map
  setTimeout(() => {
    if (!locationPickerMap) {
      locationPickerMap = L.map('location-picker-map').setView([40.7128, -74.0060], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(locationPickerMap);
      
      let marker;
      
      locationPickerMap.on('click', (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lng;
        
        if (marker) {
          marker.setLatLng(e.latlng);
        } else {
          marker = L.marker(e.latlng).addTo(locationPickerMap);
        }
      });
    }
    
    locationPickerMap.invalidateSize();
  }, 100);
}

// Create a story card element
function createStoryCard(story, parent) {
  const card = createElement('div');
  card.class('gallery-item');
  card.mousePressed(() => {
    showStoryDetail(story);
  });
  card.parent(parent);
  
  const img = createImg(story.image, story.title);
  img.class('gallery-item-img');
  img.parent(card);
  
  const info = createElement('div');
  info.class('gallery-item-info');
  info.parent(card);
  
  const title = createElement('h3', story.title);
  title.class('gallery-item-title');
  title.parent(info);
  
  const neighborhood = createElement('p', story.neighborhood);
  neighborhood.class('gallery-item-neighborhood');
  neighborhood.parent(info);
  
  const description = createElement('p', story.description);
  description.class('gallery-item-description');
  description.parent(info);
  
  const interactionBar = createElement('div');
  interactionBar.class('interaction-bar');
  interactionBar.parent(info);
  
  const likeButton = createElement('button', `❤️ ${story.likes}`);
  likeButton.class('interaction-button');
  likeButton.parent(interactionBar);
  
  const commentButton = createElement('button', `💬 ${story.comments.length}`);
  commentButton.class('interaction-button');
  commentButton.parent(interactionBar);
}

// Show story detail in a modal
function showStoryDetail(story) {
  modal.set({
    title: story.title,
    content: `
      <div class="story-detail-container">
        <img src="${story.image}" alt="${story.title}" class="story-detail-image">
        <div class="story-detail-content">
          <h2 class="story-detail-title">${story.title}</h2>
          <div class="story-detail-meta">
            <div>By: ${story.author}</div>
            <div>Neighborhood: ${story.neighborhood}</div>
            <div>Date: ${story.date}</div>
          </div>
          <p class="story-detail-text">${story.description}</p>
          <div class="story-detail-tags">
            ${story.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <div class="interaction-bar">
            <button class="interaction-button like-button" data-id="${story.id}">❤️ <span>${story.likes}</span></button>
            <button class="interaction-button">💬 <span>${story.comments.length}</span></button>
            <button class="interaction-button">🔗 Share</button>
          </div>
          <div class="comments-section">
            <h3>Comments</h3>
            ${story.comments.map(comment => `
              <div class="comment">
                <div class="comment-author">${comment.author}</div>
                <div class="comment-text">${comment.text}</div>
              </div>
            `).join('')}
            <div class="add-comment">
              <textarea placeholder="Add your comment..."></textarea>
              <button class="add-comment-button" data-id="${story.id}">Post Comment</button>
            </div>
          </div>
        </div>
      </div>
    `,
    closeText: 'Close',
    width: '80%',
    height: '80%',
    onClose: () => {
      // Nothing to do on close
    }
  });
  
  // Add event listeners for the modal content
  setTimeout(() => {
    // Like button
    document.querySelector(`.like-button[data-id="${story.id}"]`).addEventListener('click', () => {
      story.likes++;
      document.querySelector(`.like-button[data-id="${story.id}"] span`).textContent = story.likes;
    });
    
    // Add comment button
    document.querySelector(`.add-comment-button[data-id="${story.id}"]`).addEventListener('click', () => {
      const commentText = document.querySelector('.add-comment textarea').value;
      if (commentText.trim()) {
        const newComment = {
          author: currentUser.name,
          text: commentText
        };
        
        story.comments.push(newComment);
        
        // Update comments display
        const commentsSection = document.querySelector('.comments-section');
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.innerHTML = `
          <div class="comment-author">${newComment.author}</div>
          <div class="comment-text">${newComment.text}</div>
        `;
        
        commentsSection.insertBefore(commentDiv, document.querySelector('.add-comment'));
        document.querySelector('.add-comment textarea').value = '';
        
        // Update comment count
        document.querySelector(`.interaction-button:nth-child(2) span`).textContent = story.comments.length;
      }
    });
  }, 100);
}

// Window resize event handler
function windowResized() {
  const mainContent = document.getElementById('main-content');
  resizeCanvas(mainContent.offsetWidth, 0);
}

// When the window loads, start the P5 sketch
window.onload = function() {
  new p5();
};
