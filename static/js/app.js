/**
 * InstaGenie - AI-Powered Instagram Generator
 * Frontend Logic
 */

class InstaGenie {
    constructor() {
        this.logoFilename = null;
        this.brandColors = null;
        this.generatedImages = [];
        this.selectedPreset = null;
        
        // Preset palettes
        this.palettes = {
            sunset: {
                dominant: '#FF6B6B',
                palette: ['#FF6B6B', '#FEC89A', '#FFD93D', '#C1FFD7', '#6BCB77']
            },
            ocean: {
                dominant: '#0077B6',
                palette: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#48CAE4']
            },
            forest: {
                dominant: '#2D6A4F',
                palette: ['#2D6A4F', '#40916C', '#52B788', '#95D5B2', '#B7E4C7']
            },
            purple: {
                dominant: '#7209B7',
                palette: ['#7209B7', '#9D4EDD', '#C77DFF', '#E0AAFF', '#F3D5FF']
            },
            coral: {
                dominant: '#FF6B6B',
                palette: ['#FF6B6B', '#F472B6', '#FB7185', '#FECDD3', '#FFF1F2']
            },
            midnight: {
                dominant: '#6366F1',
                palette: ['#1A1B2E', '#2D3154', '#6366F1', '#A5B4FC', '#E0E7FF']
            },
            golden: {
                dominant: '#DAA520',
                palette: ['#B8860B', '#DAA520', '#FFD700', '#FFF8DC', '#FFFACD']
            },
            monochrome: {
                dominant: '#1A1A1A',
                palette: ['#1A1A1A', '#4A4A4A', '#7A7A7A', '#DADADA', '#F5F5F5']
            }
        };
        
        // Preset configurations
        this.presets = {
            socialbunkr: {
                name: 'SocialBunkr',
                industry: 'Travel & Hospitality',
                logo: '/static/presets/socialbunkr-logo.jpeg',
                colors: {
                    dominant: '#FF6B35',
                    palette: ['#FF6B35', '#F7C59F', '#2EC4B6', '#011627', '#FDFFFC']
                },
                examples: [
                    '🏨 Weekend getaway deals - 40% off on premium hostels',
                    '🎒 Backpacker special: Book 3 nights, get 1 free',
                    '🌍 New hostel launch in Goa with rooftop cafe',
                    '👥 Community night - Meet fellow travelers this Friday',
                    '💰 Student discount: Show ID, save 25% on bookings'
                ]
            },
            hylancer: {
                name: 'Hylancer',
                industry: 'Technology',
                logo: '/static/presets/hylancer-logo.jpeg',
                colors: {
                    dominant: '#6366F1',
                    palette: ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B']
                },
                examples: [
                    '💼 Top freelancers are earning 3x more - Join now',
                    '🚀 New feature: AI-powered project matching',
                    '🎯 Success story: How Sarah earned $50K in 6 months',
                    '📊 Weekly tips: 5 ways to win more clients',
                    '🎉 Zero commission for first 3 projects - Limited time'
                ]
            }
        };
        
        this.initElements();
        this.initEventListeners();
    }
    
    initElements() {
        // Form elements
        this.form = document.getElementById('generateForm');
        this.logoInput = document.getElementById('logoInput');
        this.uploadZone = document.getElementById('uploadZone');
        this.uploadContent = document.getElementById('uploadContent');
        this.uploadPreview = document.getElementById('uploadPreview');
        this.logoPreviewImg = document.getElementById('logoPreview');
        this.removeLogo = document.getElementById('removeLogo');
        this.colorExtraction = document.getElementById('colorExtraction');
        this.extractionLoading = document.getElementById('extractionLoading');
        this.colorPalette = document.getElementById('colorPalette');
        this.colorSwatches = document.getElementById('colorSwatches');
        
        this.companyName = document.getElementById('companyName');
        this.industry = document.getElementById('industry');
        this.contentTheme = document.getElementById('contentTheme');
        this.numPosts = document.getElementById('numPosts');
        this.sliderValue = document.getElementById('sliderValue');
        this.toneOptions = document.querySelectorAll('input[name="tone"]');
        
        // Preset elements
        this.presetCards = document.querySelectorAll('.preset-card');
        this.presetExamples = document.getElementById('presetExamples');
        this.exampleChips = document.getElementById('exampleChips');
        
        // Palette options
        this.paletteOptions = document.getElementById('paletteOptions');
        this.paletteOptionCards = document.querySelectorAll('.palette-option');
        
        this.generateBtn = document.getElementById('generateBtn');
        this.btnContent = this.generateBtn.querySelector('.btn-content');
        this.btnLoading = this.generateBtn.querySelector('.btn-loading');
        
        // Preview elements
        this.headerActions = document.getElementById('headerActions');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        this.emptyState = document.getElementById('emptyState');
        this.loadingState = document.getElementById('loadingState');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.instagramGrid = document.getElementById('instagramGrid');
        this.previewCards = document.getElementById('previewCards');
        
        // Modal elements
        this.modal = document.getElementById('imageModal');
        this.modalImage = document.getElementById('modalImage');
        this.modalClose = document.getElementById('modalClose');
        this.modalDownload = document.getElementById('modalDownload');
    }
    
    initEventListeners() {
        // Logo upload
        this.uploadZone.addEventListener('click', () => this.logoInput.click());
        this.logoInput.addEventListener('change', (e) => this.handleLogoSelect(e));
        this.removeLogo.addEventListener('click', (e) => {
            e.stopPropagation();
            this.clearLogo();
        });
        
        // Drag and drop
        this.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadZone.classList.add('dragover');
        });
        this.uploadZone.addEventListener('dragleave', () => {
            this.uploadZone.classList.remove('dragover');
        });
        this.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.uploadLogo(file);
            }
        });
        
        // Slider
        this.numPosts.addEventListener('input', () => this.updateSlider());
        
        // Presets
        this.presetCards.forEach(card => {
            card.addEventListener('click', () => this.selectPreset(card.dataset.preset));
        });
        
        // Palette options
        this.paletteOptionCards.forEach(card => {
            card.addEventListener('click', () => this.selectPalette(card.dataset.palette));
        });
        
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Download all
        this.downloadAllBtn.addEventListener('click', () => this.downloadAll());
        
        // Modal
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.modal.querySelector('.modal-backdrop').addEventListener('click', () => this.closeModal());
        this.modalDownload.addEventListener('click', () => this.downloadCurrentImage());
        
        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.hidden) {
                this.closeModal();
            }
        });
    }
    
    handleLogoSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.uploadLogo(file);
        }
    }
    
    async uploadLogo(file) {
        // Clear any selected preset
        if (this.selectedPreset) {
            this.selectedPreset = null;
            this.presetCards.forEach(card => card.classList.remove('active'));
            this.presetExamples.hidden = true;
        }
        
        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
            this.logoPreviewImg.src = e.target.result;
            this.uploadContent.hidden = true;
            this.uploadPreview.hidden = false;
        };
        reader.readAsDataURL(file);
        
        // Show extraction loading
        this.colorExtraction.hidden = false;
        this.extractionLoading.hidden = false;
        this.colorPalette.hidden = true;
        
        // Upload to server
        const formData = new FormData();
        formData.append('logo', file);
        
        try {
            const response = await fetch('/upload-logo', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.logoFilename = data.filename;
                this.brandColors = data.colors;
                this.displayBrandColors(data.colors);
            } else {
                this.showError('Failed to upload logo: ' + data.error);
                this.clearLogo();
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showError('Failed to upload logo');
            this.clearLogo();
        }
    }
    
    displayBrandColors(colors, fromLogo = true) {
        this.extractionLoading.hidden = true;
        this.colorPalette.hidden = false;
        this.paletteOptions.hidden = false;
        
        // Mark if colors are from logo
        if (fromLogo) {
            this.colorPalette.classList.add('from-logo');
            // Deselect preset palettes
            this.paletteOptionCards.forEach(card => card.classList.remove('selected'));
        }
        
        this.colorSwatches.innerHTML = '';
        
        // Add dominant color (selected by default)
        const dominantSwatch = document.createElement('div');
        dominantSwatch.className = 'color-swatch dominant selected';
        dominantSwatch.style.backgroundColor = colors.dominant;
        dominantSwatch.title = `${colors.dominant} (Primary - Click to select)`;
        dominantSwatch.dataset.color = colors.dominant;
        dominantSwatch.addEventListener('click', () => this.selectColor(dominantSwatch, colors.dominant));
        this.colorSwatches.appendChild(dominantSwatch);
        
        // Add palette colors
        colors.palette.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.title = `${color} (Click to select as primary)`;
            swatch.dataset.color = color;
            swatch.addEventListener('click', () => this.selectColor(swatch, color));
            this.colorSwatches.appendChild(swatch);
        });
    }
    
    selectColor(swatch, color) {
        // Remove selected class from all swatches
        this.colorSwatches.querySelectorAll('.color-swatch').forEach(s => {
            s.classList.remove('selected');
        });
        
        // Add selected class to clicked swatch
        swatch.classList.add('selected');
        
        // Update dominant color in brandColors
        if (this.brandColors) {
            this.brandColors.dominant = color;
            console.log('Selected primary color:', color);
        }
        
        // Deselect preset palettes when logo color is selected
        this.paletteOptionCards.forEach(card => card.classList.remove('selected'));
        this.colorPalette.classList.add('from-logo');
    }
    
    selectPalette(paletteName) {
        const palette = this.palettes[paletteName];
        if (!palette) return;
        
        // Update brand colors
        this.brandColors = { ...palette };
        
        // Update UI - deselect logo palette
        this.colorPalette.classList.remove('from-logo');
        this.colorSwatches.querySelectorAll('.color-swatch').forEach(s => {
            s.classList.remove('selected');
        });
        
        // Select the palette card
        this.paletteOptionCards.forEach(card => {
            card.classList.toggle('selected', card.dataset.palette === paletteName);
        });
        
        // Update the color swatches display to show selected palette
        this.displayBrandColors(palette, false);
        
        console.log('Selected palette:', paletteName, palette);
    }
    
    clearLogo() {
        this.logoInput.value = '';
        this.logoFilename = null;
        this.brandColors = null;
        this.uploadContent.hidden = false;
        this.uploadPreview.hidden = true;
        this.colorExtraction.hidden = true;
        this.paletteOptions.hidden = true;
        this.colorPalette.classList.remove('from-logo');
        this.paletteOptionCards.forEach(card => card.classList.remove('selected'));
    }
    
    selectPreset(presetId) {
        const preset = this.presets[presetId];
        if (!preset) return;
        
        // Toggle selection
        if (this.selectedPreset === presetId) {
            // Deselect
            this.selectedPreset = null;
            this.presetCards.forEach(card => card.classList.remove('active'));
            this.presetExamples.hidden = true;
            this.companyName.value = '';
            this.industry.value = '';
            this.brandColors = null;
            this.logoFilename = null;
            
            // Clear logo preview
            this.clearLogo();
            return;
        }
        
        this.selectedPreset = presetId;
        
        // Update UI
        this.presetCards.forEach(card => {
            card.classList.toggle('active', card.dataset.preset === presetId);
        });
        
        // Fill form fields
        this.companyName.value = preset.name;
        this.industry.value = preset.industry;
        
        // Set brand colors
        this.brandColors = preset.colors;
        
        // Show logo preview
        this.logoPreviewImg.src = preset.logo;
        this.uploadContent.hidden = true;
        this.uploadPreview.hidden = false;
        
        // Show color palette
        this.colorExtraction.hidden = false;
        this.extractionLoading.hidden = true;
        this.colorPalette.hidden = false;
        this.displayBrandColors(preset.colors, true);
        
        // Show example content ideas
        this.showExamples(preset.examples);
        
        // Mark as using preset (not uploaded file)
        this.logoFilename = `preset:${presetId}`;
    }
    
    showExamples(examples) {
        this.presetExamples.hidden = false;
        this.exampleChips.innerHTML = '';
        
        examples.forEach(example => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'example-chip';
            chip.textContent = example;
            chip.addEventListener('click', () => {
                this.contentTheme.value = example;
                // Visual feedback
                chip.style.background = 'var(--primary)';
                chip.style.color = 'white';
                setTimeout(() => {
                    chip.style.background = '';
                    chip.style.color = '';
                }, 300);
            });
            this.exampleChips.appendChild(chip);
        });
    }
    
    updateSlider() {
        const value = parseInt(this.numPosts.value);
        this.sliderValue.textContent = value;
    }
    
    getSelectedTone() {
        const selectedTone = document.querySelector('input[name="tone"]:checked');
        return selectedTone ? selectedTone.value : 'creative';
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        
        // Validate
        if (!this.companyName.value || !this.industry.value || !this.contentTheme.value) {
            this.showError('Please fill in all required fields');
            return;
        }
        
        // Show loading state
        this.setLoading(true);
        this.emptyState.hidden = true;
        this.resultsContainer.hidden = true;
        this.loadingState.hidden = false;
        
        // Prepare request data
        const requestData = {
            company_name: this.companyName.value,
            industry: this.industry.value,
            content_theme: this.contentTheme.value,
            num_posts: parseInt(this.numPosts.value),
            tone: this.getSelectedTone(),
            logo_filename: this.logoFilename,
            brand_colors: this.brandColors || {
                dominant: '#6366f1',
                palette: ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e']
            }
        };
        
        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.generatedImages = data.images;
                this.displayResults(data.images);
            } else {
                this.showError('Generation failed: ' + data.error);
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Generation error:', error);
            this.showError('Failed to generate posts: ' + error.message);
            this.showEmptyState();
        } finally {
            this.setLoading(false);
        }
    }
    
    displayResults(images) {
        this.loadingState.hidden = true;
        this.resultsContainer.hidden = false;
        this.headerActions.hidden = false;
        
        // Clear previous results
        this.instagramGrid.innerHTML = '';
        this.previewCards.innerHTML = '';
        
        // Filter to only show successfully generated images
        const successfulImages = images.filter(img => img.filename);
        
        successfulImages.forEach((image, index) => {
            // Add to Instagram grid
            const gridImg = document.createElement('img');
            gridImg.src = image.url;
            gridImg.alt = `Generated post ${index + 1}`;
            gridImg.addEventListener('click', () => this.openModal(image.url));
            this.instagramGrid.appendChild(gridImg);
            
            // Add preview card
            const card = this.createPreviewCard(image, index);
            this.previewCards.appendChild(card);
        });
        
        // Update generatedImages to only include successful ones
        this.generatedImages = successfulImages;
    }
    
    createPreviewCard(image, index) {
        const card = document.createElement('div');
        card.className = 'preview-card';
        const toneEmoji = {
            'creative': '✨',
            'professional': '💼',
            'playful': '🎉',
            'minimal': '🎯',
            'bold': '🔥'
        };
        const emoji = toneEmoji[image.tone] || '✨';
        
        card.innerHTML = `
            <div class="preview-card-image">
                <img src="${image.url}" alt="Generated post ${index + 1}">
                <div class="preview-card-overlay">
                    <div class="overlay-actions">
                        <button class="overlay-btn view-btn" title="View Full Size">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                                <path d="M11 8v6M8 11h6"/>
                            </svg>
                        </button>
                        <button class="overlay-btn download-btn" title="Download">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div class="preview-card-info">
                <span class="style-tag">${emoji} ${image.tone} #${image.variation || index + 1}</span>
            </div>
        `;
        
        // Add event listeners
        card.querySelector('.view-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openModal(image.url);
        });
        card.querySelector('.download-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.downloadImage(image.url, `instagenie-${image.tone}-${index + 1}.png`);
        });
        
        return card;
    }
    
    createErrorCard(image, index) {
        const card = document.createElement('div');
        card.className = 'preview-card error-card';
        card.innerHTML = `
            <div class="preview-card-image">
                <div class="error-message">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p>${image.error || 'Generation failed'}</p>
                </div>
            </div>
            <div class="preview-card-info">
                <span class="style-tag">${image.style}</span>
            </div>
        `;
        return card;
    }
    
    openModal(imageUrl) {
        this.modalImage.src = imageUrl;
        this.modal.hidden = false;
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        this.modal.hidden = true;
        document.body.style.overflow = '';
    }
    
    downloadCurrentImage() {
        const imageUrl = this.modalImage.src;
        this.downloadImage(imageUrl, 'instagenie-post.png');
    }
    
    downloadImage(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    downloadAll() {
        this.generatedImages.forEach((image, index) => {
            if (image.filename) {
                setTimeout(() => {
                    this.downloadImage(image.url, `instagenie-${image.tone}-${index + 1}.png`);
                }, index * 500);
            }
        });
    }
    
    setLoading(isLoading) {
        this.generateBtn.disabled = isLoading;
        this.btnContent.hidden = isLoading;
        this.btnLoading.hidden = !isLoading;
    }
    
    showEmptyState() {
        this.loadingState.hidden = true;
        this.resultsContainer.hidden = true;
        this.emptyState.hidden = false;
    }
    
    showError(message) {
        // Simple alert for POC - could be replaced with a toast notification
        console.error(message);
        alert(message);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new InstaGenie();
    
    // Initialize slider
    window.app.updateSlider();
});
