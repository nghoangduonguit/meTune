// Configuration
const SHEETS_FOLDER = 'sheets';

// State
let currentFolder = null;
let currentImages = [];
let currentImageIndex = 0;
let allFolders = [];

// DOM Elements
const folderSection = document.getElementById('folderSection');
const sliderSection = document.getElementById('sliderSection');
const folderList = document.getElementById('folderList');
const searchInput = document.getElementById('searchInput');
const backBtn = document.getElementById('backBtn');
const folderTitle = document.getElementById('folderTitle');
const sliderImage = document.getElementById('sliderImage');
const imageCounter = document.getElementById('imageCounter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const thumbnailList = document.getElementById('thumbnailList');

// Initialize
async function init() {
    await loadFolders();
    setupEventListeners();
}

// Load folders from sheets directory
async function loadFolders() {
    try {
        const response = await fetch('api.php?action=getFolders');
        const data = await response.json();
        
        if (data.success) {
            allFolders = data.folders;
            displayFolders(allFolders);
        } else {
            console.error('Error loading folders:', data.error);
            displayMessage('Error loading folders: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading folders:', error);
        displayMessage('Error connecting to server. Make sure PHP is running.');
    }
}

// Display folders
function displayFolders(folders) {
    folderList.innerHTML = '';
    
    if (folders.length === 0) {
        folderList.innerHTML = '<p style="padding: 20px; text-align: center; color: #7f8c8d;">No folders found. Please add folders to the "sheets" directory.</p>';
        return;
    }

    folders.forEach(folder => {
        const folderItem = document.createElement('div');
        folderItem.className = 'folder-item';
        folderItem.innerHTML = `<span>${folder}</span>`;
        folderItem.onclick = () => openFolder(folder);
        folderList.appendChild(folderItem);
    });
}

// Display message
function displayMessage(message) {
    folderList.innerHTML = `<p style="padding: 20px; text-align: center; color: #7f8c8d;">${message}</p>`;
}

// Get first letters of each word in a string
function getFirstLetters(text) {
    return text
        .split(/\s+/) // Split by whitespace
        .map(word => word.charAt(0).toLowerCase())
        .join('');
}

// Search folders
function searchFolders() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    const filteredFolders = allFolders.filter(folder => {
        const folderLower = folder.toLowerCase();
        
        // Match if search term is found in folder name
        if (folderLower.includes(searchTerm)) {
            return true;
        }
        
        // Match if search term matches first letters of each word
        const firstLetters = getFirstLetters(folder);
        if (firstLetters.includes(searchTerm)) {
            return true;
        }
        
        return false;
    });
    
    displayFolders(filteredFolders);
}

// Open folder and load images
async function openFolder(folderName) {
    currentFolder = folderName;
    currentImages = [];
    currentImageIndex = 0;

    try {
        const response = await fetch(`api.php?action=getImages&folder=${encodeURIComponent(folderName)}`);
        const data = await response.json();
        
        if (data.success) {
            currentImages = data.images.map(img => `${SHEETS_FOLDER}/${folderName}/${img}`);
            
            if (currentImages.length === 0) {
                alert(`No images found in ${folderName}.`);
                return;
            }
            
            showSlider();
        } else {
            console.error('Error loading images:', data.error);
            alert('Error loading images: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading images:', error);
        alert('Error loading images from folder');
    }
}

// Show slider section
function showSlider() {
    folderSection.classList.add('hidden');
    sliderSection.classList.remove('hidden');
    folderTitle.textContent = currentFolder;
    displayCurrentImage();
    createThumbnails();
}

// Hide slider and show folders
function hideSlider() {
    sliderSection.classList.add('hidden');
    folderSection.classList.remove('hidden');
    currentFolder = null;
    currentImages = [];
    currentImageIndex = 0;
}

// Display current image
function displayCurrentImage() {
    if (currentImages.length === 0) return;

    sliderImage.src = currentImages[currentImageIndex];
    sliderImage.alt = `Image ${currentImageIndex + 1}`;
    imageCounter.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;

    // Update button states
    prevBtn.disabled = currentImageIndex === 0;
    nextBtn.disabled = currentImageIndex === currentImages.length - 1;

    // Update active thumbnail
    updateActiveThumbnail();
}

// Create thumbnails
function createThumbnails() {
    thumbnailList.innerHTML = '';
    
    currentImages.forEach((imageSrc, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = imageSrc;
        thumbnail.className = 'thumbnail';
        thumbnail.alt = `Thumbnail ${index + 1}`;
        thumbnail.onclick = () => goToImage(index);
        
        if (index === currentImageIndex) {
            thumbnail.classList.add('active');
        }
        
        thumbnailList.appendChild(thumbnail);
    });
}

// Update active thumbnail
function updateActiveThumbnail() {
    const thumbnails = thumbnailList.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentImageIndex);
    });
}

// Navigate to specific image
function goToImage(index) {
    currentImageIndex = index;
    displayCurrentImage();
}

// Previous image
function previousImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        displayCurrentImage();
    }
}

// Next image
function nextImage() {
    if (currentImageIndex < currentImages.length - 1) {
        currentImageIndex++;
        displayCurrentImage();
    }
}

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', searchFolders);
    backBtn.addEventListener('click', hideSlider);
    prevBtn.addEventListener('click', previousImage);
    nextBtn.addEventListener('click', nextImage);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!sliderSection.classList.contains('hidden')) {
            if (e.key === 'ArrowLeft') {
                previousImage();
            } else if (e.key === 'ArrowRight') {
                nextImage();
            } else if (e.key === 'Escape') {
                hideSlider();
            }
        }
    });
}

// Start the app
init();
