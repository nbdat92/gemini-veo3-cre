/**
 * Gemini VEO3 Video Generator - Frontend JavaScript
 * Xử lý tương tác người dùng và API calls
 */

// Global state management
const AppState = {
    currentPrompts: [],
    generationInProgress: false,
    generatedVideos: [],
    settings: {
        aspectRatio: '16:9',
        duration: 5,
        resolution: '1080p'
    }
};

// DOM utility functions
const DOM = {
    get: (id) => document.getElementById(id),
    query: (selector) => document.querySelector(selector),
    queryAll: (selector) => document.querySelectorAll(selector),
    create: (tag, className, innerHTML) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }
};

// API utility functions
const API = {
    async post(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    
    async postFormData(url, formData) {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        return await response.json();
    },
    
    async get(url) {
        const response = await fetch(url);
        return await response.json();
    }
};

// File upload handling
class FileUploader {
    constructor(inputId, displayId, callback) {
        this.input = DOM.get(inputId);
        this.display = DOM.get(displayId);
        this.callback = callback;
        
        if (this.input) {
            this.input.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        this.setupDragAndDrop();
    }
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.updateDisplay(file.name);
            if (this.callback) {
                this.callback(file, event.target);
            }
        }
    }
    
    updateDisplay(fileName) {
        if (this.display) {
            this.display.innerHTML = `<i class="fas fa-file text-success"></i> ${fileName}`;
            this.display.className = 'mt-2 text-success';
        }
    }
    
    setupDragAndDrop() {
        const uploadAreas = DOM.queryAll('.upload-area');
        uploadAreas.forEach(area => {
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.classList.add('dragover');
            });
            
            area.addEventListener('dragleave', (e) => {
                e.preventDefault();
                area.classList.remove('dragover');
            });
            
            area.addEventListener('drop', (e) => {
                e.preventDefault();
                area.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    const inputId = area.onclick.toString().match(/getElementById\('(\w+)'/)?.[1];
                    if (inputId) {
                        const input = DOM.get(inputId);
                        if (input) {
                            input.files = files;
                            input.dispatchEvent(new Event('change'));
                        }
                    }
                }
            });
        });
    }
}

// Toast notification system
class ToastManager {
    static show(type, message, duration = 5000) {
        // Remove existing toasts
        const existingToasts = DOM.queryAll('.toast-notification');
        existingToasts.forEach(toast => toast.remove());
        
        const toast = DOM.create('div', `alert alert-${type} alert-dismissible fade show toast-notification`, `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `);
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 350px;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }
    
    static success(message) {
        this.show('success', `<i class="fas fa-check-circle"></i> ${message}`);
    }
    
    static error(message) {
        this.show('danger', `<i class="fas fa-exclamation-circle"></i> ${message}`);
    }
    
    static warning(message) {
        this.show('warning', `<i class="fas fa-exclamation-triangle"></i> ${message}`);
    }
    
    static info(message) {
        this.show('info', `<i class="fas fa-info-circle"></i> ${message}`);
    }
}

// Loading manager
class LoadingManager {
    static show(message = 'Đang xử lý...') {
        DOM.get('loadingMessage').textContent = message;
        const modal = new bootstrap.Modal(DOM.get('loadingModal'));
        modal.show();
        return modal;
    }
    
    static hide() {
        const modal = bootstrap.Modal.getInstance(DOM.get('loadingModal'));
        if (modal) modal.hide();
    }
}

// Progress manager
class ProgressManager {
    static show() {
        const container = DOM.get('progressContainer');
        if (container) {
            container.style.display = 'block';
            container.classList.add('fade-in');
        }
    }
    
    static hide() {
        const container = DOM.get('progressContainer');
        if (container) {
            container.style.display = 'none';
        }
    }
    
    static update(current, total, currentPrompt = '') {
        const progressBar = DOM.get('progressBar');
        const progressStatus = DOM.get('progressStatus');
        const currentPromptDiv = DOM.get('currentPrompt');
        
        if (progressBar && progressStatus) {
            const percentage = Math.round((current / total) * 100);
            progressBar.style.width = percentage + '%';
            progressBar.textContent = percentage + '%';
            progressStatus.textContent = `Hoàn thành: ${current}/${total} videos`;
            
            if (currentPromptDiv && currentPrompt) {
                const shortPrompt = currentPrompt.length > 60 
                    ? currentPrompt.substring(0, 60) + '...'
                    : currentPrompt;
                currentPromptDiv.textContent = `Đang xử lý: ${shortPrompt}`;
            }
        }
    }
    
    static setComplete() {
        const progressBar = DOM.get('progressBar');
        const progressStatus = DOM.get('progressStatus');
        
        if (progressBar && progressStatus) {
            progressBar.className = 'progress-bar bg-success';
            progressBar.style.width = '100%';
            progressBar.textContent = '100%';
            progressStatus.textContent = 'Hoàn thành tất cả videos!';
        }
    }
    
    static setError() {
        const progressBar = DOM.get('progressBar');
        const progressStatus = DOM.get('progressStatus');
        
        if (progressBar && progressStatus) {
            progressBar.className = 'progress-bar bg-danger';
            progressStatus.textContent = 'Có lỗi xảy ra trong quá trình tạo video!';
        }
    }
}

// Video management
class VideoManager {
    static displayVideos(videos) {
        const container = DOM.get('videosContainer');
        const list = DOM.get('videosList');
        
        if (!container || !list) return;
        
        list.innerHTML = '';
        
        videos.forEach((video, index) => {
            const videoItem = DOM.create('div', 'video-item slide-up', `
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="mb-1">
                        <i class="fas fa-video text-primary"></i> 
                        Video ${index + 1}
                    </h6>
                    <span class="badge bg-success">
                        <i class="fas fa-check"></i> Hoàn thành
                    </span>
                </div>
                <p class="text-muted mb-3">${video.prompt}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="text-muted small">
                        <i class="fas fa-clock"></i> ${video.status || 'completed'}
                    </div>
                    <div>
                        <a href="/download/${video.filename}" 
                           class="btn btn-primary btn-sm me-2" 
                           target="_blank">
                            <i class="fas fa-download"></i> Tải về
                        </a>
                        <button type="button" 
                                class="btn btn-outline-secondary btn-sm" 
                                onclick="VideoManager.previewVideo('${video.filename}')">
                            <i class="fas fa-eye"></i> Xem
                        </button>
                    </div>
                </div>
            `);
            
            list.appendChild(videoItem);
        });
        
        container.style.display = 'block';
        container.classList.add('fade-in');
    }
    
    static previewVideo(filename) {
        ToastManager.info('Tính năng preview video sẽ được thêm vào sau...');
    }
    
    static async downloadAll() {
        const videos = AppState.generatedVideos;
        if (videos.length === 0) {
            ToastManager.warning('Không có video nào để tải!');
            return;
        }
        
        ToastManager.info(`Bắt đầu tải ${videos.length} videos...`);
        
        for (const video of videos) {
            const link = document.createElement('a');
            link.href = `/download/${video.filename}`;
            link.download = video.filename;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

// Main application functions
const App = {
    async uploadPrompts(file, input) {
        const formData = new FormData();
        formData.append('prompts_file', file);
        
        LoadingManager.show('Đang tải file prompts...');
        
        try {
            const result = await API.postFormData('/upload_prompts', formData);
            LoadingManager.hide();
            
            if (result.status === 'success') {
                AppState.currentPrompts = result.prompts || [];
                this.displayPromptsPreview(result.prompts_count, result.prompts);
                ToastManager.success(result.message);
            } else {
                ToastManager.error(result.message);
            }
        } catch (error) {
            LoadingManager.hide();
            ToastManager.error('Lỗi khi tải file: ' + error.message);
        }
    },
    
    displayPromptsPreview(count, prompts) {
        const preview = DOM.get('promptsPreview');
        const list = DOM.get('promptsList');
        
        if (!preview || !list) return;
        
        list.innerHTML = '';
        list.className = 'bg-light p-3 rounded scrollable';
        list.style.maxHeight = '200px';
        list.style.overflowY = 'auto';
        
        prompts.forEach((prompt, index) => {
            const promptDiv = DOM.create('div', 'mb-2', `
                <strong>${index + 1}:</strong> 
                <span class="text-dark">${prompt}</span>
            `);
            list.appendChild(promptDiv);
        });
        
        if (count > 5) {
            const moreDiv = DOM.create('div', 'text-muted', 
                `<i class="fas fa-ellipsis-h"></i> và ${count - 5} prompts khác`);
            list.appendChild(moreDiv);
        }
        
        preview.style.display = 'block';
        preview.classList.add('fade-in');
    },
    
    async generatePrompt() {
        const description = DOM.get('userDescription').value.trim();
        if (!description) {
            ToastManager.warning('Vui lòng nhập mô tả video!');
            return;
        }
        
        LoadingManager.show('Đang tạo prompt tối ưu...');
        
        try {
            const result = await API.post('/generate_prompt', { description });
            LoadingManager.hide();
            
            if (result.status === 'success') {
                DOM.get('optimizedPrompt').value = result.optimized_prompt;
                DOM.get('generatedPrompt').style.display = 'block';
                DOM.get('generatedPrompt').classList.add('fade-in');
                ToastManager.success('Prompt đã được tạo thành công!');
            } else {
                ToastManager.error(result.message);
            }
        } catch (error) {
            LoadingManager.hide();
            ToastManager.error('Lỗi khi tạo prompt: ' + error.message);
        }
    },
    
    copyPrompt() {
        const promptTextarea = DOM.get('optimizedPrompt');
        if (!promptTextarea) return;
        
        promptTextarea.select();
        document.execCommand('copy');
        ToastManager.success('Prompt đã được copy vào clipboard!');
        
        // Visual feedback
        const copyBtn = event.target.closest('button');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check text-success"></i> Đã copy';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    },
    
    async startGeneration() {
        if (AppState.generationInProgress) {
            ToastManager.warning('Quá trình tạo video đang diễn ra!');
            return;
        }
        
        if (AppState.currentPrompts.length === 0) {
            ToastManager.warning('Vui lòng upload file prompts trước!');
            return;
        }
        
        // Get current settings
        AppState.settings = {
            aspect_ratio: DOM.get('aspectRatio').value,
            duration: DOM.get('duration').value,
            resolution: DOM.get('resolution').value
        };
        
        AppState.generationInProgress = true;
        ProgressManager.show();
        
        try {
            const result = await API.post('/start_generation', AppState.settings);
            
            if (result.status === 'success') {
                ToastManager.success(result.message);
                this.startProgressMonitoring();
            } else {
                ToastManager.error(result.message);
                AppState.generationInProgress = false;
                ProgressManager.hide();
            }
        } catch (error) {
            ToastManager.error('Lỗi khi bắt đầu tạo video: ' + error.message);
            AppState.generationInProgress = false;
            ProgressManager.hide();
        }
    },
    
    async startProgressMonitoring() {
        const checkStatus = async () => {
            try {
                const status = await API.get('/generation_status');
                
                ProgressManager.update(
                    status.completed_videos, 
                    status.total_prompts,
                    status.videos && status.videos.length > 0 
                        ? status.videos[status.videos.length - 1].prompt 
                        : ''
                );
                
                if (status.status === 'completed') {
                    ProgressManager.setComplete();
                    AppState.generationInProgress = false;
                    AppState.generatedVideos = status.videos || [];
                    VideoManager.displayVideos(AppState.generatedVideos);
                    ToastManager.success(`Đã tạo thành công ${status.completed_videos} videos! 🎉`);
                    return;
                } else if (status.status === 'error') {
                    ProgressManager.setError();
                    AppState.generationInProgress = false;
                    ToastManager.error('Quá trình tạo video gặp lỗi!');
                    return;
                }
                
                // Continue monitoring
                setTimeout(checkStatus, 2000);
                
            } catch (error) {
                console.error('Error checking status:', error);
                setTimeout(checkStatus, 5000); // Retry after longer delay
            }
        };
        
        checkStatus();
    },
    
    async checkInitialStatus() {
        try {
            const status = await API.get('/generation_status');
            
            if (status.status === 'processing') {
                AppState.generationInProgress = true;
                ProgressManager.show();
                this.startProgressMonitoring();
            } else if (status.videos && status.videos.length > 0) {
                AppState.generatedVideos = status.videos;
                VideoManager.displayVideos(AppState.generatedVideos);
            }
        } catch (error) {
            console.error('Error checking initial status:', error);
        }
    }
};

// Global functions for HTML onclick handlers
window.updateFileName = function(input, displayId) {
    const display = DOM.get(displayId);
    if (input.files && input.files[0] && display) {
        display.innerHTML = `<i class="fas fa-file text-success"></i> ${input.files[0].name}`;
        display.className = 'mt-2 text-success';
    }
};

window.uploadPrompts = function(input) {
    if (input.files && input.files[0]) {
        App.uploadPrompts(input.files[0], input);
    }
};

window.generatePrompt = function() {
    App.generatePrompt();
};

window.copyPrompt = function() {
    App.copyPrompt();
};

window.startGeneration = function() {
    App.startGeneration();
};

window.downloadAllVideos = function() {
    VideoManager.downloadAll();
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Gemini VEO3 Generator initialized');
    
    // Initialize file uploaders
    new FileUploader('cookiesFile', 'cookiesFileName');
    new FileUploader('promptsFile', 'promptsFileName', App.uploadPrompts.bind(App));
    
    // Check initial status
    App.checkInitialStatus();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ Application ready!');
});