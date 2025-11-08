<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$action = $_GET['action'] ?? '';
$sheetsDir = __DIR__ . '/sheets';

// Get list of folders
if ($action === 'getFolders') {
    $folders = [];
    
    if (is_dir($sheetsDir)) {
        $items = scandir($sheetsDir);
        
        foreach ($items as $item) {
            if ($item !== '.' && $item !== '..' && is_dir($sheetsDir . '/' . $item)) {
                $folders[] = $item;
            }
        }
    }
    
    sort($folders);
    echo json_encode(['success' => true, 'folders' => $folders]);
    exit;
}

// Get list of images in a folder
if ($action === 'getImages') {
    $folder = $_GET['folder'] ?? '';
    
    if (empty($folder)) {
        echo json_encode(['success' => false, 'error' => 'Folder name required']);
        exit;
    }
    
    $folderPath = $sheetsDir . '/' . $folder;
    
    if (!is_dir($folderPath)) {
        echo json_encode(['success' => false, 'error' => 'Folder not found']);
        exit;
    }
    
    $images = [];
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    
    $items = scandir($folderPath);
    
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        
        $filePath = $folderPath . '/' . $item;
        
        if (is_file($filePath)) {
            $extension = strtolower(pathinfo($item, PATHINFO_EXTENSION));
            
            if (in_array($extension, $allowedExtensions)) {
                $images[] = $item;
            }
        }
    }
    
    // Sort images naturally (e.g., image1, image2, image10)
    natsort($images);
    $images = array_values($images);
    
    echo json_encode(['success' => true, 'folder' => $folder, 'images' => $images]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Invalid action']);
?>
