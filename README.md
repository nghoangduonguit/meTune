# Sheets Management Tool

A simple PHP-based tool for browsing folders and viewing images in a slider. Automatically detects folders and images without configuration files.

## Structure

```
sheets-management/
├── index.html
├── api.php              (auto-detects folders & images)
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── font/
└── sheets/
    └── [your-folders]/
        └── [your-images]
```

## Setup

1. **Add your folders**: 
   - Simply create folders inside the `sheets/` directory
   - No configuration needed!

2. **Add images to each folder**:
   - Place images (jpg, png, gif, webp, etc.) in each folder
   - Images will be automatically detected

3. **Start a PHP server**:
   ```bash
   php -S localhost:8000
   ```

4. **Open the tool**:
   - Visit `http://localhost:8000` in your browser

## Features

- 📁 Automatically lists all folders from the sheets directory
- 🔍 Search/filter folders in real-time
- 🖼️ View images in a slider (one per slide)
- 🔄 Auto-detects image files (no configuration needed)
- ⌨️ Keyboard navigation (Arrow keys, Escape)
- 📱 Responsive design

## Supported Image Formats

- JPG/JPEG
- PNG
- GIF
- BMP
- WEBP
- SVG

## Example Usage

Just add folders with images:
```
sheets/
├── project-alpha/
│   ├── design1.jpg
│   ├── design2.png
│   └── mockup.jpg
└── project-beta/
    ├── screenshot1.png
    └── screenshot2.png
```

That's it! The tool will automatically show both folders and all images.
