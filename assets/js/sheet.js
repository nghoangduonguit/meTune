// Configuration
const SHEETS_FOLDER = 'sheets';

// State
let currentFolder = null;
let currentImages = [];
let currentImageIndex = 0;

// DOM Elements
const sliderSection = document.getElementById('sliderSection');
const folderTitle = document.getElementById('folderTitle');
const sliderImage = document.getElementById('sliderImage');
const imageCounter = document.getElementById('imageCounter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const thumbnailList = document.getElementById('thumbnailList');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// Initialize
async function init() {
    const slug = getSlugFromURL();
    if (slug) {
        await loadSheet(slug);
    } else {
        alert('Không tìm thấy bài hát');
        window.location.href = 'index.html';
    }
    setupEventListeners();
}

// Get slug from URL parameter
function getSlugFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug');
}

// Load sheet by slug
async function loadSheet(slug) {
    try {
        const response = await fetch('sheets-config.json');
        const data = await response.json();
        
        if (data && data.folders) {
            const folder = data.folders.find(f => f.slug === slug);
            
            if (folder) {
                currentFolder = folder.title;
                folderTitle.textContent = folder.title;
                currentImages = folder.images.map(img => `${SHEETS_FOLDER}/${folder.name}/${img}`);
                
                if (currentImages.length === 0) {
                    alert(`Không tìm thấy hình ảnh trong ${folder.title}`);
                    window.location.href = 'index.html';
                    return;
                }
                
                currentImageIndex = 0;
                displayCurrentImage();
                createThumbnails();
            } else {
                alert(`Không tìm thấy bài hát: ${slug}`);
                window.location.href = 'index.html';
            }
        }
    } catch (error) {
        console.error('Error loading sheet:', error);
        alert('Lỗi khi tải bản nhạc');
        window.location.href = 'index.html';
    }
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
    updateFullscreenBackground();
}

// Previous image
function previousImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        displayCurrentImage();
        updateFullscreenBackground();
    }
}

// Next image
function nextImage() {
    if (currentImageIndex < currentImages.length - 1) {
        currentImageIndex++;
        displayCurrentImage();
        updateFullscreenBackground();
    }
}

// Toggle fullscreen mode
function toggleFullscreen() {
    const isFullscreen = sliderSection.classList.contains('fullscreen');
    
    if (!isFullscreen) {
        // Enter fullscreen
        sliderSection.classList.add('fullscreen');
        fullscreenBtn.textContent = '✕ Thoát toàn màn hình';
        
        // Set background image for fullscreen mode
        updateFullscreenBackground();
        
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
        
        // Remove background image
        const sliderContent = document.querySelector('.slider-content');
        sliderContent.style.backgroundImage = '';
        
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

// Update fullscreen background image
function updateFullscreenBackground() {
    if (sliderSection.classList.contains('fullscreen') && currentImages.length > 0) {
        const sliderContent = document.querySelector('.slider-content');
        sliderContent.style.backgroundImage = `url('${currentImages[currentImageIndex]}')`;
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

// Setup event listeners
function setupEventListeners() {
    prevBtn.addEventListener('click', previousImage);
    nextBtn.addEventListener('click', nextImage);
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Listen for fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            previousImage();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextImage();
        } else if (e.key === 'Escape') {
            if (sliderSection.classList.contains('fullscreen')) {
                toggleFullscreen();
            }
        } else if (e.key === 'f' || e.key === 'F') {
            e.preventDefault();
            toggleFullscreen();
        }
    });
}

// Start the app
init();
