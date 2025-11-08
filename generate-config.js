#!/usr/bin/env node

/**
 * This script scans the sheets directory and generates sheets-config.json
 * Run this script whenever you add new folders or images to the sheets directory
 * 
 * Usage: node generate-config.js
 */

const fs = require('fs');
const path = require('path');

const SHEETS_DIR = path.join(__dirname, 'sheets');
const OUTPUT_FILE = path.join(__dirname, 'sheets-config.json');
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];

function isImageFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext);
}

function naturalSort(a, b) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function createSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single
}

function scanSheetsDirectory() {
    const folders = [];

    try {
        // Check if sheets directory exists
        if (!fs.existsSync(SHEETS_DIR)) {
            console.error('Error: sheets directory not found!');
            process.exit(1);
        }

        // Read all items in sheets directory
        const items = fs.readdirSync(SHEETS_DIR);

        // Process each folder
        items.forEach(item => {
            const itemPath = path.join(SHEETS_DIR, item);
            const stats = fs.statSync(itemPath);

            // Skip if not a directory or hidden
            if (!stats.isDirectory() || item.startsWith('.')) {
                return;
            }

            // Get all image files in the folder
            const images = [];
            const folderItems = fs.readdirSync(itemPath);

            folderItems.forEach(file => {
                const filePath = path.join(itemPath, file);
                const fileStats = fs.statSync(filePath);

                if (fileStats.isFile() && isImageFile(file)) {
                    images.push(file);
                }
            });

            // Sort images naturally
            images.sort(naturalSort);

            folders.push({
                name: item,
                slug: createSlug(item),
                title: item,
                images: images
            });
        });

        // Sort folders alphabetically
        folders.sort((a, b) => a.name.localeCompare(b.name));

        return folders;

    } catch (error) {
        console.error('Error scanning directory:', error);
        process.exit(1);
    }
}

function generateConfig() {
    console.log('Scanning sheets directory...');
    
    const folders = scanSheetsDirectory();
    
    const config = { folders };

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(config, null, 2));

    console.log(`✓ Configuration generated successfully!`);
    console.log(`✓ Found ${folders.length} folder(s)`);
    
    folders.forEach(folder => {
        console.log(`  - ${folder.name}: ${folder.images.length} image(s)`);
    });

    console.log(`\n✓ Config saved to: ${OUTPUT_FILE}`);
}

// Run the script
generateConfig();
