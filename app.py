#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gemini VEO3 Video Generator Web Application
Ứng dụng web tạo video tự động sử dụng Gemini VEO3
"""

import os
import json
import asyncio
import aiohttp
import requests
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file, redirect, url_for, flash
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import logging

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-here')
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
DOWNLOAD_FOLDER = 'downloads' 
COOKIES_FOLDER = 'cookies'
ALLOWED_EXTENSIONS = {'txt', 'json'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['DOWNLOAD_FOLDER'] = DOWNLOAD_FOLDER
app.config['COOKIES_FOLDER'] = COOKIES_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure directories exist
for folder in [UPLOAD_FOLDER, DOWNLOAD_FOLDER, COOKIES_FOLDER]:
    os.makedirs(folder, exist_ok=True)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables để lưu trạng thái
app_state = {
    'cookies_loaded': False,
    'cookies_file': None,
    'gemini_session': None,
    'current_prompts': [],
    'generation_status': 'idle',
    'generated_videos': []
}

def allowed_file(filename):
    """Kiểm tra file extension hợp lệ"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class CookieManager:
    """Quản lý cookies cho Gemini authentication"""
    
    @staticmethod
    def load_cookies_from_file(filepath):
        """Load cookies từ file txt hoặc json"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                
            # Try parsing as JSON first
            try:
                cookies_data = json.loads(content)
                return cookies_data
            except json.JSONDecodeError:
                # If not JSON, try parsing as text format
                cookies = {}
                for line in content.split('\n'):
                    line = line.strip()
                    if '=' in line:
                        key, value = line.split('=', 1)
                        cookies[key.strip()] = value.strip()
                return cookies
                
        except Exception as e:
            logger.error(f"Error loading cookies: {str(e)}")
            return None
    
    @staticmethod
    def save_cookies_to_file(cookies_data, filename):
        """Lưu cookies vào file"""
        try:
            filepath = os.path.join(COOKIES_FOLDER, filename)
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(cookies_data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            logger.error(f"Error saving cookies: {str(e)}")
            return False
    
    @staticmethod
    def verify_gemini_cookies(cookies):
        """Verify cookies với Gemini"""
        try:
            # Tạo session với cookies
            session = requests.Session()
            
            # Convert cookies dict to requests format
            for name, value in cookies.items():
                session.cookies.set(name, value, domain='.google.com')
            
            # Test request to Gemini
            test_url = 'https://gemini.google.com/app'
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            
            response = session.get(test_url, headers=headers, timeout=10)
            
            # Kiểm tra response có thành công không
            if response.status_code == 200 and 'gemini' in response.text.lower():
                return True, session
            else:
                return False, None
                
        except Exception as e:
            logger.error(f"Error verifying cookies: {str(e)}")
            return False, None

class GeminiAPI:
    """Tích hợp với Gemini API"""
    
    def __init__(self, session=None):
        self.session = session or requests.Session()
    
    def generate_optimized_prompt(self, user_description):
        """Tạo prompt tối ưu cho VEO3 từ mô tả của user"""
        try:
            # Template prompt cho VEO3
            system_prompt = """
            Bạn là chuyên gia tạo prompts cho Gemini VEO3. 
            Hãy chuyển đổi mô tả của người dùng thành prompt chi tiết, chuyên nghiệp cho VEO3.
            
            Yêu cầu:
            - Mô tả rõ ràng cảnh quay, góc camera
            - Thêm chi tiết về ánh sáng, màu sắc
            - Mô tả chuyển động, hành động cụ thể
            - Độ dài khoảng 100-200 từ
            - Sử dụng tiếng Anh chuyên nghiệp
            
            Mô tả người dùng: {user_description}
            
            Hãy tạo prompt VEO3 tối ưu:
            """
            
            # Gọi Gemini API để tạo prompt (simplified version)
            # Trong thực tế sẽ cần integrate với Gemini API thực
            optimized_prompt = f"A cinematic video of {user_description} with professional lighting, smooth camera movements, high detail, 4K quality, dynamic composition"
            
            return optimized_prompt
            
        except Exception as e:
            logger.error(f"Error generating prompt: {str(e)}")
            return user_description

class VEO3VideoGenerator:
    """Tạo video với VEO3"""
    
    def __init__(self, session=None):
        self.session = session or requests.Session()
    
    async def generate_video(self, prompt, settings):
        """Tạo video với VEO3"""
        try:
            # VEO3 API parameters
            video_params = {
                'prompt': prompt,
                'aspect_ratio': settings.get('aspect_ratio', '16:9'),
                'duration': settings.get('duration', 5),
                'resolution': settings.get('resolution', '1080p'),
                'model': 'veo3'
            }
            
            logger.info(f"Generating video with params: {video_params}")
            
            # Simulate VEO3 API call (replace with real API)
            await asyncio.sleep(2)  # Simulate processing time
            
            # Mock response - replace with real VEO3 API integration
            video_result = {
                'status': 'success',
                'video_url': f'https://example.com/video_{datetime.now().strftime("%Y%m%d_%H%M%S")}.mp4',
                'video_id': f'video_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
                'duration': video_params['duration'],
                'resolution': video_params['resolution']
            }
            
            return video_result
            
        except Exception as e:
            logger.error(f"Error generating video: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    async def download_video(self, video_url, filename):
        """Tải video về máy"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(video_url) as response:
                    if response.status == 200:
                        filepath = os.path.join(DOWNLOAD_FOLDER, filename)
                        with open(filepath, 'wb') as f:
                            async for chunk in response.content.iter_chunked(8192):
                                f.write(chunk)
                        return True, filepath
                    else:
                        return False, f"HTTP {response.status}"
        except Exception as e:
            logger.error(f"Error downloading video: {str(e)}")
            return False, str(e)

# Initialize generators
gemini_api = GeminiAPI()
veo3_generator = VEO3VideoGenerator()

# Routes
@app.route('/')
def index():
    """Trang chủ"""
    return render_template('index.html', app_state=app_state)

@app.route('/upload_cookies', methods=['POST'])
def upload_cookies():
    """Upload và verify cookies"""
    try:
        if 'cookies_file' not in request.files:
            flash('Không có file được chọn!', 'error')
            return redirect(url_for('index'))
        
        file = request.files['cookies_file']
        if file.filename == '':
            flash('Không có file được chọn!', 'error')
            return redirect(url_for('index'))
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['COOKIES_FOLDER'], filename)
            file.save(filepath)
            
            # Load và verify cookies
            cookies = CookieManager.load_cookies_from_file(filepath)
            if cookies:
                is_valid, session = CookieManager.verify_gemini_cookies(cookies)
                if is_valid:
                    app_state['cookies_loaded'] = True
                    app_state['cookies_file'] = filename
                    app_state['gemini_session'] = session
                    flash(f'✅ Cookies đã được tải và xác thực thành công từ file: {filename}', 'success')
                else:
                    flash('❌ Cookies không hợp lệ hoặc đã hết hạn!', 'error')
            else:
                flash('❌ Không thể đọc file cookies!', 'error')
        else:
            flash('❌ File không hợp lệ! Chỉ chấp nhận .txt và .json', 'error')
            
    except Exception as e:
        flash(f'❌ Lỗi khi tải cookies: {str(e)}', 'error')
    
    return redirect(url_for('index'))

@app.route('/upload_prompts', methods=['POST'])
def upload_prompts():
    """Upload file prompts"""
    try:
        if 'prompts_file' not in request.files:
            return jsonify({'status': 'error', 'message': 'Không có file được chọn!'})
        
        file = request.files['prompts_file']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'Không có file được chọn!'})
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Đọc prompts từ file
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Split prompts by lines (mỗi dòng là 1 prompt)
            prompts = [line.strip() for line in content.split('\n') if line.strip()]
            app_state['current_prompts'] = prompts
            
            return jsonify({
                'status': 'success',
                'message': f'Đã tải {len(prompts)} prompts thành công!',
                'prompts_count': len(prompts),
                'prompts': prompts[:5]  # Show first 5 prompts
            })
        else:
            return jsonify({'status': 'error', 'message': 'File không hợp lệ!'})
            
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/generate_prompt', methods=['POST'])
def generate_prompt():
    """Tạo prompt tối ưu từ mô tả"""
    try:
        data = request.json
        user_description = data.get('description', '')
        
        if not user_description:
            return jsonify({'status': 'error', 'message': 'Vui lòng nhập mô tả!'})
        
        # Tạo prompt tối ưu
        optimized_prompt = gemini_api.generate_optimized_prompt(user_description)
        
        return jsonify({
            'status': 'success',
            'original_description': user_description,
            'optimized_prompt': optimized_prompt
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/start_generation', methods=['POST'])
def start_generation():
    """Bắt đầu tạo video hàng loạt"""
    try:
        if not app_state['cookies_loaded']:
            return jsonify({'status': 'error', 'message': 'Vui lòng upload cookies trước!'})
        
        if not app_state['current_prompts']:
            return jsonify({'status': 'error', 'message': 'Vui lòng upload file prompts trước!'})
        
        # Get settings
        data = request.json
        settings = {
            'aspect_ratio': data.get('aspect_ratio', '16:9'),
            'duration': int(data.get('duration', 5)),
            'resolution': data.get('resolution', '1080p')
        }
        
        # Start generation process
        app_state['generation_status'] = 'processing'
        app_state['generated_videos'] = []
        
        # Process videos (simplified - in real app would use background tasks)
        asyncio.create_task(process_video_generation(settings))
        
        return jsonify({
            'status': 'success',
            'message': 'Bắt đầu tạo video...',
            'prompts_count': len(app_state['current_prompts'])
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

async def process_video_generation(settings):
    """Xử lý tạo video hàng loạt (background task)"""
    try:
        for i, prompt in enumerate(app_state['current_prompts']):
            logger.info(f"Processing prompt {i+1}/{len(app_state['current_prompts'])}: {prompt}")
            
            # Generate video
            result = await veo3_generator.generate_video(prompt, settings)
            
            if result['status'] == 'success':
                # Download video
                video_filename = f"video_{i+1}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
                download_success, download_path = await veo3_generator.download_video(
                    result['video_url'], 
                    video_filename
                )
                
                if download_success:
                    app_state['generated_videos'].append({
                        'prompt': prompt,
                        'filename': video_filename,
                        'path': download_path,
                        'status': 'completed'
                    })
                    logger.info(f"Video {i+1} completed and downloaded")
                else:
                    logger.error(f"Failed to download video {i+1}")
            else:
                logger.error(f"Failed to generate video {i+1}: {result.get('message', 'Unknown error')}")
        
        app_state['generation_status'] = 'completed'
        logger.info("All videos generation completed")
        
    except Exception as e:
        logger.error(f"Error in video generation process: {str(e)}")
        app_state['generation_status'] = 'error'

@app.route('/generation_status')
def generation_status():
    """Kiểm tra trạng thái tạo video"""
    return jsonify({
        'status': app_state['generation_status'],
        'completed_videos': len(app_state['generated_videos']),
        'total_prompts': len(app_state['current_prompts']),
        'videos': app_state['generated_videos'][-5:]  # Show last 5 videos
    })

@app.route('/download/<filename>')
def download_video(filename):
    """Tải video đã tạo"""
    try:
        filepath = os.path.join(app.config['DOWNLOAD_FOLDER'], filename)
        if os.path.exists(filepath):
            return send_file(filepath, as_attachment=True)
        else:
            flash('File không tồn tại!', 'error')
            return redirect(url_for('index'))
    except Exception as e:
        flash(f'Lỗi khi tải file: {str(e)}', 'error')
        return redirect(url_for('index'))

@app.route('/api/status')
def api_status():
    """API trạng thái ứng dụng"""
    return jsonify(app_state)

if __name__ == '__main__':
    print("🚀 Starting Gemini VEO3 Video Generator...")
    print("📁 Upload folder:", UPLOAD_FOLDER)
    print("📁 Download folder:", DOWNLOAD_FOLDER)
    print("🍪 Cookies folder:", COOKIES_FOLDER)
    print("🌐 Server running at: http://localhost:5000")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )