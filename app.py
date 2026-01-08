"""
InstaGenie - AI-Powered Instagram Post Generator
Using Gemini 2.0 Flash Image Model (Nano Banana)
"""

import os
import base64
import io
import uuid
from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from PIL import Image
from google import genai
from google.genai import types
from colorthief import ColorThief

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['GENERATED_FOLDER'] = 'generated'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# Ensure folders exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['GENERATED_FOLDER'], exist_ok=True)

# Configure Gemini API with new SDK
GEMINI_API_KEY = "AIzaSyA7oHRsBE5VFgdxTchxZOpBXspGHOaV2Fs"
client = genai.Client(api_key=GEMINI_API_KEY)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_brand_colors(image_path):
    """Extract dominant colors from the uploaded logo."""
    try:
        color_thief = ColorThief(image_path)
        dominant_color = color_thief.get_color(quality=1)
        palette = color_thief.get_palette(color_count=5, quality=1)
        
        # Convert to hex
        def rgb_to_hex(rgb):
            return '#{:02x}{:02x}{:02x}'.format(*rgb)
        
        return {
            'dominant': rgb_to_hex(dominant_color),
            'palette': [rgb_to_hex(c) for c in palette]
        }
    except Exception as e:
        print(f"Color extraction error: {e}")
        return {
            'dominant': '#6366f1',
            'palette': ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e']
        }


def create_brand_prompt(company_name, industry, content_theme, tone, brand_colors, variation_num=1):
    """Create an enhanced prompt with brand context and tone."""
    
    tone_descriptions = {
        'creative': 'Creative and artistic, with unique visual elements, unexpected compositions, and imaginative design',
        'professional': 'Professional and corporate, clean lines, sophisticated look, business-appropriate aesthetics',
        'playful': 'Fun and playful, bright colors, dynamic shapes, energetic and youthful vibe',
        'minimal': 'Minimalist and clean, lots of white space, simple geometric shapes, elegant simplicity',
        'bold': 'Bold and impactful, strong colors, dramatic contrasts, attention-grabbing visuals'
    }
    
    tone_desc = tone_descriptions.get(tone, tone_descriptions['creative'])
    
    # Add slight variation for multiple posts
    variation_hints = [
        'Focus on the main subject with a clean background.',
        'Include lifestyle context showing the product/service in use.',
        'Use an abstract or artistic interpretation.',
        'Emphasize the emotional appeal and human connection.',
        'Highlight the key benefit or value proposition visually.'
    ]
    variation_hint = variation_hints[(variation_num - 1) % len(variation_hints)]
    
    prompt = f"""Create a professional Instagram post image for {company_name}, a company in the {industry} industry.

IMPORTANT: Include the provided company logo prominently in the image design. The logo should be visible and well-integrated into the composition.

Topic/Theme: {content_theme}

Tone & Style:
- {tone_desc}
- {variation_hint}

MANDATORY Color Palette (USE THESE EXACT COLORS):
- Primary Color: {brand_colors['dominant']} - use this as the dominant color
- Secondary Colors: {', '.join(brand_colors['palette'][:3])}
- The entire image should be designed using ONLY these brand colors

Requirements:
- Feature the company logo prominently in the design
- Use the specified brand color palette throughout
- Modern, high-resolution quality suitable for Instagram
- Aspect ratio: 4:5 (1080x1350 pixels - Instagram optimal)
- Professional and polished look
- Eye-catching composition that stops the scroll

Create a compelling, brand-consistent image for social media marketing."""

    return prompt


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload-logo', methods=['POST'])
def upload_logo():
    """Handle logo upload and extract brand colors."""
    if 'logo' not in request.files:
        return jsonify({'error': 'No logo file provided'}), 400
    
    file = request.files['logo']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # Extract brand colors
        colors = extract_brand_colors(filepath)
        
        return jsonify({
            'success': True,
            'filename': unique_filename,
            'colors': colors,
            'message': 'Brand colors extracted successfully!'
        })
    
    return jsonify({'error': 'Invalid file type'}), 400


@app.route('/generate', methods=['POST'])
def generate_posts():
    """Generate Instagram posts using Gemini 2.5 Flash Image (Nano Banana)."""
    try:
        data = request.json
        company_name = data.get('company_name', 'Your Brand')
        industry = data.get('industry', 'General')
        content_theme = data.get('content_theme', 'Product showcase')
        num_posts = min(int(data.get('num_posts', 1)), 5)  # Max 5 for demo
        tone = data.get('tone', 'creative')
        logo_filename = data.get('logo_filename')
        brand_colors = data.get('brand_colors', {
            'dominant': '#6366f1',
            'palette': ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e']
        })
        
        # Load logo image if available
        logo_image = None
        if logo_filename:
            try:
                if logo_filename.startswith('preset:'):
                    # Load preset logo
                    preset_name = logo_filename.replace('preset:', '')
                    logo_path = os.path.join('static', 'presets', f'{preset_name}-logo.jpeg')
                else:
                    # Load uploaded logo
                    logo_path = os.path.join(app.config['UPLOAD_FOLDER'], logo_filename)
                
                if os.path.exists(logo_path):
                    logo_image = Image.open(logo_path)
                    print(f"Logo loaded from: {logo_path}")
            except Exception as e:
                print(f"Error loading logo: {e}")
        
        generated_images = []
        
        for i in range(num_posts):
            prompt = create_brand_prompt(
                company_name, 
                industry, 
                content_theme, 
                tone, 
                brand_colors,
                variation_num=i + 1
            )
            
            try:
                print(f"Generating image {i+1}/{num_posts} with tone: {tone}")
                print(f"Prompt: {prompt[:200]}...")
                
                # Generate image using Nano Banana (Gemini 2.5 Flash Image)
                # Based on official docs: https://ai.google.dev/gemini-api/docs/image-generation
                # Use text-and-image-to-image when logo is available
                if logo_image:
                    # Include logo in generation (image editing mode)
                    response = client.models.generate_content(
                        model='gemini-2.5-flash-image',
                        contents=[prompt, logo_image],
                    )
                else:
                    # Text-only generation
                    response = client.models.generate_content(
                        model='gemini-2.5-flash-image',
                        contents=[prompt],
                    )
                
                print(f"Response received")
                
                # Process response - look for image parts using response.parts
                image_data = None
                for part in response.parts:
                    if part.inline_data:
                        print(f"Found inline_data with mime_type: {part.inline_data.mime_type}")
                        if part.inline_data.mime_type.startswith('image/'):
                            image_data = part.inline_data.data
                            break
                
                if image_data:
                    # Save the generated image
                    image_filename = f"{uuid.uuid4()}.png"
                    image_path = os.path.join(app.config['GENERATED_FOLDER'], image_filename)
                    
                    # The data from Gemini is already bytes
                    if isinstance(image_data, str):
                        image_bytes = base64.b64decode(image_data)
                    else:
                        image_bytes = image_data
                    
                    with open(image_path, 'wb') as f:
                        f.write(image_bytes)
                    
                    print(f"Image saved: {image_filename}")
                    
                    generated_images.append({
                        'filename': image_filename,
                        'tone': tone,
                        'variation': i + 1,
                        'url': f'/generated/{image_filename}'
                    })
                else:
                    # Check if there's text response instead
                    text_response = ""
                    for part in response.parts:
                        if hasattr(part, 'text') and part.text:
                            text_response = part.text[:200]
                            break
                    
                    print(f"No image in response. Text: {text_response}")
                    generated_images.append({
                        'filename': None,
                        'tone': tone,
                        'variation': i + 1,
                        'error': f'No image generated. Response: {text_response}' if text_response else 'No image in response'
                    })
                    
            except Exception as e:
                import traceback
                error_trace = traceback.format_exc()
                print(f"Generation error for image {i+1}: {e}")
                print(f"Traceback: {error_trace}")
                generated_images.append({
                    'filename': None,
                    'tone': tone,
                    'variation': i + 1,
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'images': generated_images,
            'message': f'Generated {len([img for img in generated_images if img.get("filename")])} images'
        })
        
    except Exception as e:
        import traceback
        print(f"Global error: {e}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@app.route('/generated/<filename>')
def serve_generated(filename):
    """Serve generated images."""
    return send_from_directory(app.config['GENERATED_FOLDER'], filename)


@app.route('/uploads/<filename>')
def serve_uploads(filename):
    """Serve uploaded files."""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/static/presets/<filename>')
def serve_presets(filename):
    """Serve preset logo files."""
    return send_from_directory('static/presets', filename)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
