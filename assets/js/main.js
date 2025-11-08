// Configuration
const SHEETS_FOLDER = 'sheets';

// State
let currentFolder = null;
let currentImages = [];
let currentImageIndex = 0;
let allFolders = [];
let foldersData = [];

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
const fullscreenBtn = document.getElementById('fullscreenBtn');

// Initialize
async function init() {
    await loadFolders();
    setupEventListeners();
    handleRoute(); // Check URL on load
}

// Load folders from config file
async function loadFolders() {
    try {
        const response = await fetch('sheets-config.json');
        const data = await response.json();
        
        if (data && data.folders) {
            foldersData = data.folders;
            allFolders = data.folders.map(f => f.name);
            displayFolders(allFolders);
        } else {
            console.error('Error: Invalid config format');
            displayMessage('Lỗi: Định dạng file cấu hình không hợp lệ');
        }
    } catch (error) {
        console.error('Error loading folders:', error);
        displayMessage('Lỗi tải cấu hình. Vui lòng chạy lệnh: node generate-config.js');
    }
}

// Display folders
function displayFolders(folders) {
    folderList.innerHTML = '';
    
    if (folders.length === 0) {
        folderList.innerHTML = '<p style="padding: 20px; text-align: center; color: #7f8c8d;">Không tìm thấy thư mục nào. Vui lòng thêm thư mục vào "sheets".</p>';
        return;
    }

    folders.forEach(folder => {
        const folderData = foldersData.find(f => f.name === folder);
        const folderItem = document.createElement('div');
        folderItem.className = 'folder-item';
        folderItem.innerHTML = `<span>${folder}</span>`;
        folderItem.onclick = () => {
            if (folderData) {
                openFolderBySlug(folderData.slug);
            } else {
                openFolder(folder);
            }
        };
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

// Open folder by slug and update URL
function openFolderBySlug(slug) {
    // Update URL without page reload
    window.location.hash = `#/${slug}`;
    openFolderBySlugDirect(slug);
}

// Open folder by slug (direct, no URL update)
function openFolderBySlugDirect(slug) {
    const folder = foldersData.find(f => f.slug === slug);
    
    if (folder) {
        openFolder(folder.name, folder);
    } else {
        alert(`Không tìm thấy thư mục: ${slug}`);
        window.location.hash = '#/';
    }
}

// Open folder and load images
function openFolder(folderName, folderData = null) {
    currentFolder = folderName;
    currentImages = [];
    currentImageIndex = 0;

    if (!folderData) {
        folderData = foldersData.find(f => f.name === folderName);
    }
    
    if (folderData) {
        currentImages = folderData.images.map(img => `${SHEETS_FOLDER}/${folderName}/${img}`);
        
        if (currentImages.length === 0) {
            alert(`Không tìm thấy hình ảnh trong ${folderName}.`);
            window.location.hash = '#/';
            return;
        }
        
        showSlider();
    } else {
        alert(`Không tìm thấy thư mục: ${folderName}`);
        window.location.hash = '#/';
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
    // Exit fullscreen if active
    if (sliderSection.classList.contains('fullscreen')) {
        toggleFullscreen();
    }
    
    // Update URL to home
    window.location.hash = '#/';
    
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
    sliderImage.alt = `Trang ${currentImageIndex + 1}`;
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
        thumbnail.alt = `Trang ${index + 1}`;
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

// Toggle fullscreen mode
function toggleFullscreen() {
    const isFullscreen = sliderSection.classList.contains('fullscreen');
    
    if (!isFullscreen) {
        // Enter fullscreen
        sliderSection.classList.add('fullscreen');
        fullscreenBtn.textContent = '✕ Thoát toàn màn hình';
        
        // Try to enter browser fullscreen API
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.log('Fullscreen API not available:', err);
            });
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen
        sliderSection.classList.remove('fullscreen');
        fullscreenBtn.textContent = '⛶ Toàn màn hình';
        
        // Exit browser fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(err => {
                console.log('Exit fullscreen error:', err);
            });
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Handle fullscreen change events
function handleFullscreenChange() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && !document.msFullscreenElement) {
        sliderSection.classList.remove('fullscreen');
        fullscreenBtn.textContent = '⛶ Toàn màn hình';
    }
}

// Handle URL routing
function handleRoute() {
    const hash = window.location.hash;
    
    if (!hash || hash === '#/' || hash === '#') {
        // Home page - show folders
        if (!sliderSection.classList.contains('hidden')) {
            sliderSection.classList.add('hidden');
            folderSection.classList.remove('hidden');
        }
    } else {
        // Extract slug from hash (e.g., #/co-mot-tinh-yeu)
        const slug = hash.replace('#/', '');
        if (slug && foldersData.length > 0) {
            openFolderBySlugDirect(slug);
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', searchFolders);
    backBtn.addEventListener('click', hideSlider);
    prevBtn.addEventListener('click', previousImage);
    nextBtn.addEventListener('click', nextImage);
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Listen for hash changes (back/forward navigation)
    window.addEventListener('hashchange', handleRoute);

    // Listen for fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!sliderSection.classList.contains('hidden')) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                previousImage();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextImage();
            } else if (e.key === 'Escape') {
                if (sliderSection.classList.contains('fullscreen')) {
                    toggleFullscreen();
                } else {
                    hideSlider();
                }
            } else if (e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                toggleFullscreen();
            }
        }
    });
}

// Start the app
init();
