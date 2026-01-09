# PostGen Agent

AI-powered Instagram post generator using Gemini 2.5 Flash Image model.

## Setup

1. Create a virtual environment and install dependencies:
```bash
cd /home/pankaj/POC/InstaGenie
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Set up your API key (choose one method):

**Option A: Create a `.env` file** (recommended)
```bash
echo 'GEMINI_API_KEY=your_api_key_here' > .env
```

**Option B: Export as environment variable**
```bash
export GEMINI_API_KEY="your_api_key_here"
```

3. Run the application:
```bash
python app.py
```

4. Open http://localhost:5000 in your browser.

## Features

- Upload company logo for brand-aware image generation
- Extract brand colors automatically from logo
- Multiple tone options (Creative, Professional, Playful, Minimal, Bold)
- Preset brand palettes
- Demo presets for SocialBunkr and Hylancer

## Tech Stack

- Flask (Python backend)
- Gemini 2.5 Flash Image API (AI image generation)
- ColorThief (brand color extraction)
- Vanilla JavaScript (frontend)
