/**
 * Debug version với simple functions
 */

console.log('Debug.js loaded');

// Simple Loading Manager
const SimpleLoader = {
    modal: null,
    
    show(message) {
        console.log('SimpleLoader.show:', message);
        const modalEl = document.getElementById('loadingModal');
        const messageEl = document.getElementById('loadingMessage');
        
        if (messageEl) messageEl.textContent = message;
        
        if (modalEl) {
            // Force hide first
            this.hide();
            
            this.modal = new bootstrap.Modal(modalEl);
            this.modal.show();
            
            // Safety timeout
            setTimeout(() => {
                console.log('Safety timeout - hiding modal');
                this.hide();
            }, 10000);
        }
    },
    
    hide() {
        console.log('SimpleLoader.hide called');
        try {
            if (this.modal) {
                this.modal.hide();
                this.modal = null;
            }
            
            // Force cleanup
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        } catch (error) {
            console.error('Error hiding modal:', error);
        }
    }
};

// Simple Generate Prompt function
window.simpleGeneratePrompt = async function() {
    console.log('simpleGeneratePrompt called');
    
    const input = document.getElementById('userDescription');
    const output = document.getElementById('optimizedPrompt');
    const container = document.getElementById('generatedPrompt');
    
    if (!input || !output || !container) {
        console.error('Missing DOM elements:', { input, output, container });
        alert('Lỗi: Không tìm thấy elements cần thiết');
        return;
    }
    
    const description = input.value.trim();
    if (!description) {
        alert('Vui lòng nhập mô tả video!');
        return;
    }
    
    console.log('Starting generate prompt with:', description);
    SimpleLoader.show('Đang tạo prompt...');
    
    try {
        const response = await fetch('/generate_prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: description })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Result:', result);
        
        if (result.status === 'success') {
            output.value = result.optimized_prompt;
            container.style.display = 'block';
            
            // Show success message
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-success alert-dismissible fade show';
            alertDiv.innerHTML = `
                ✅ Prompt đã tạo thành công!
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            input.parentNode.insertBefore(alertDiv, input);
            
            setTimeout(() => alertDiv.remove(), 3000);
        } else {
            throw new Error(result.message || 'Lỗi không xác định');
        }
        
    } catch (error) {
        console.error('Generate prompt error:', error);
        alert('Lỗi: ' + error.message);
    } finally {
        SimpleLoader.hide();
    }
};

// Simple Upload Prompts
window.simpleUploadPrompts = async function(input) {
    console.log('simpleUploadPrompts called');
    
    if (!input.files || !input.files[0]) {
        alert('Vui lòng chọn file!');
        return;
    }
    
    const file = input.files[0];
    console.log('File selected:', file.name, file.size);
    
    if (!file.name.toLowerCase().endsWith('.txt')) {
        alert('Chỉ chấp nhận file .txt!');
        return;
    }
    
    SimpleLoader.show('Đang tải file...');
    
    try {
        const formData = new FormData();
        formData.append('prompts_file', file);
        
        const response = await fetch('/upload_prompts', {
            method: 'POST',
            body: formData
        });
        
        console.log('Upload response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Upload result:', result);
        
        if (result.status === 'success') {
            // Show prompts preview
            const preview = document.getElementById('promptsPreview');
            const list = document.getElementById('promptsList');
            
            if (preview && list) {
                list.innerHTML = '';
                result.prompts.forEach((prompt, index) => {
                    const div = document.createElement('div');
                    div.className = 'mb-2';
                    div.innerHTML = `<strong>${index + 1}:</strong> ${prompt}`;
                    list.appendChild(div);
                });
                
                if (result.prompts_count > 5) {
                    const moreDiv = document.createElement('div');
                    moreDiv.className = 'text-muted';
                    moreDiv.textContent = `... và ${result.prompts_count - 5} prompts khác`;
                    list.appendChild(moreDiv);
                }
                
                preview.style.display = 'block';
            }
            
            // Show success message
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-success alert-dismissible fade show';
            alertDiv.innerHTML = `
                ✅ ${result.message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            input.parentNode.insertBefore(alertDiv, input);
            
            setTimeout(() => alertDiv.remove(), 3000);
        } else {
            throw new Error(result.message || 'Lỗi upload');
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        alert('Lỗi upload: ' + error.message);
    } finally {
        SimpleLoader.hide();
    }
};

// Simple Copy Prompt
window.simpleCopyPrompt = function() {
    console.log('simpleCopyPrompt called');
    
    const textarea = document.getElementById('optimizedPrompt');
    if (!textarea) {
        alert('Không tìm thấy prompt để copy!');
        return;
    }
    
    try {
        textarea.select();
        document.execCommand('copy');
        
        // Show success message
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-info alert-dismissible fade show';
        alertDiv.innerHTML = `
            📋 Prompt đã được copy vào clipboard!
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        textarea.parentNode.insertBefore(alertDiv, textarea);
        
        setTimeout(() => alertDiv.remove(), 2000);
    } catch (error) {
        console.error('Copy error:', error);
        alert('Lỗi khi copy: ' + error.message);
    }
};

// Simple Start Generation (placeholder)
window.simpleStartGeneration = function() {
    alert('Tính năng tạo video đang được phát triển...');
};

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Debug.js DOM ready');
    
    // Replace original functions with debug versions
    window.generatePrompt = window.simpleGeneratePrompt;
    window.uploadPrompts = window.simpleUploadPrompts;
    window.copyPrompt = window.simpleCopyPrompt;
    window.startGeneration = window.simpleStartGeneration;
    
    console.log('Debug functions registered');
    
    // Test elements exist
    const elements = {
        userDescription: document.getElementById('userDescription'),
        optimizedPrompt: document.getElementById('optimizedPrompt'),
        generatedPrompt: document.getElementById('generatedPrompt'),
        promptsFile: document.getElementById('promptsFile'),
        promptsPreview: document.getElementById('promptsPreview'),
        promptsList: document.getElementById('promptsList'),
        loadingModal: document.getElementById('loadingModal'),
        loadingMessage: document.getElementById('loadingMessage')
    };
    
    console.log('Elements check:', elements);
    
    const missing = Object.keys(elements).filter(key => !elements[key]);
    if (missing.length > 0) {
        console.warn('Missing elements:', missing);
    } else {
        console.log('All required elements found ✅');
    }
});