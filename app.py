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
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['GENERATED_FOLDER'] = 'generated'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# Ensure folders exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['GENERATED_FOLDER'], exist_ok=True)

# Configure Gemini API with new SDK
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set. Create a .env file with GEMINI_API_KEY=your_key")
client = genai.Client(api_key=GEMINI_API_KEY)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_brand_colors(image_path):
    """Extract dominant colors from logo using ColorThief"""
    try:
        color_thief = ColorThief(image_path)
        dominant = color_thief.get_color(quality=1)
        palette = color_thief.get_palette(color_count=6, quality=1)
        
        def rgb_to_hex(rgb):
            return '#{:02x}{:02x}{:02x}'.format(rgb[0], rgb[1], rgb[2])
        
        return {
            'dominant': rgb_to_hex(dominant),
            'palette': [rgb_to_hex(color) for color in palette]
        }
    except Exception as e:
        print(f"Error extracting colors: {e}")
        return {
            'dominant': '#3498db',
            'palette': ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6']
        }


def create_brand_prompt(company_name, industry, content_theme, tone_option, brand_colors, variation_hint):
    """Create a detailed prompt for brand-aware image generation"""
    
    tone_descriptions = {
        'creative': 'Artistic, imaginative, and visually striking with unique creative elements',
        'professional': 'Clean, corporate, and polished with a business-appropriate aesthetic',
        'playful': 'Fun, vibrant, and energetic with playful visual elements',
        'minimal': 'Simple, clean, and focused with minimal visual clutter',
        'bold': 'Strong, impactful, and attention-grabbing with bold colors and shapes'
    }
    
    tone_desc = tone_descriptions.get(tone_option, tone_descriptions['creative'])
    
    prompt = f"""Create a professional Instagram post image for {company_name}, a company in the {industry} industry.

Topic/Theme: {content_theme}

Tone & Style:
- {tone_desc}
- Incorporate the company logo prominently and naturally into the design.
- Use the provided brand colors as the primary color scheme: {', '.join(brand_colors['palette'][:3])}
- Emphasize the primary brand color: {brand_colors['dominant']}
- Ensure the design is cohesive with the brand identity.
- Modern, high-resolution quality suitable for Instagram
- Aspect ratio: 4:5 (1080x1350 pixels - Instagram optimal)
- Professional and polished look
- No text overlays unless specifically requested
- Clean, eye-catching composition that stops the scroll

{variation_hint}

Make this image compelling and share-worthy for social media marketing."""
    
    return prompt


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload-logo', methods=['POST'])
def upload_logo():
    if 'logo' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['logo']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        colors = extract_brand_colors(filepath)
        
        return jsonify({
            'success': True,
            'filename': unique_filename,
            'colors': colors
        })
    
    return jsonify({'error': 'Invalid file type'}), 400


@app.route('/generate', methods=['POST'])
def generate_posts():
    try:
        data = request.json
        company_name = data.get('company_name', 'Company')
        industry = data.get('industry', 'Technology')
        content_theme = data.get('content_theme', 'Product showcase')
        tone_option = data.get('tone_option', 'creative')
        logo_filename = data.get('logo_filename')
        brand_colors = data.get('brand_colors', {
            'dominant': '#3498db',
            'palette': ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6']
        })
        
        # Load logo image if available
        logo_image = None
        if logo_filename and logo_filename.startswith('preset:'):
            preset_id = logo_filename.split(':')[1]
            logo_path = os.path.join('static', 'presets', f"{preset_id}-logo.jpeg")
            if os.path.exists(logo_path):
                logo_image = Image.open(logo_path)
        elif logo_filename:
            logo_path = os.path.join(app.config['UPLOAD_FOLDER'], logo_filename)
            if os.path.exists(logo_path):
                logo_image = Image.open(logo_path)
        
        # Generate 2 variations
        variation_hints = [
            "Focus on visual storytelling with dynamic composition.",
            "Emphasize brand identity with elegant simplicity."
        ]
        
        generated_images = []
        
        for i, hint in enumerate(variation_hints):
            prompt = create_brand_prompt(
                company_name, industry, content_theme,
                tone_option, brand_colors, hint
            )
            
            try:
                # Prepare contents with logo image if available
                contents = [prompt]
                if logo_image:
                    contents.append(logo_image)
                
                response = client.models.generate_content(
                    model='gemini-2.5-flash-image',
                    contents=contents,
                )
                
                # Process response
                for part in response.parts:
                    if part.inline_data is not None:
                        # Save generated image
                        image = part.as_image()
                        image_filename = f"{uuid.uuid4()}.png"
                        image_path = os.path.join(app.config['GENERATED_FOLDER'], image_filename)
                        image.save(image_path)
                        
                        generated_images.append({
                            'url': f'/generated/{image_filename}',
                            'variation': i + 1
                        })
                        break
                        
            except Exception as e:
                print(f"Error generating image {i+1}: {e}")
                generated_images.append({
                    'error': str(e),
                    'variation': i + 1
                })
        
        return jsonify({
            'success': True,
            'images': generated_images
        })
        
    except Exception as e:
        print(f"Generation error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/generated/<filename>')
def serve_generated(filename):
    return send_from_directory(app.config['GENERATED_FOLDER'], filename)


@app.route('/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
