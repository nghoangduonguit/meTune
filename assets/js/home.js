// State
let allFolders = [];
let foldersData = [];

// DOM Elements
const folderList = document.getElementById('folderList');
const searchInput = document.getElementById('searchInput');

// Initialize
async function init() {
    await loadFolders();
    setupEventListeners();
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
        const folderItem = document.createElement('a');
        folderItem.href = folderData ? `sheet.html?slug=${folderData.slug}` : `sheet.html?slug=${folder}`;
        folderItem.className = 'folder-item';
        folderItem.innerHTML = `<span>${folder}</span>`;
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
        .split(/\s+/)
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

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', searchFolders);
}

// Start the app
init();
