# InstaGenie - AI-Powered Instagram Post Generator

<p align="center">
  <strong>🎨 Create stunning, brand-aware Instagram posts with AI</strong>
</p>

InstaGenie is a proof-of-concept application that leverages **Google Gemini 2.5 Flash** (Nano Banana) to generate professional Instagram posts tailored to your brand identity.

## ✨ Features

- **🖼️ Logo Upload & Brand Color Extraction** - Upload your logo and automatically extract your brand's color palette
- **🎯 Smart Prompt Engineering** - AI wraps your content theme with brand context for better results
- **📸 Batch Generation** - Generate up to 5 style variations at once:
  - Product-focused
  - Lifestyle/Atmospheric
  - Educational/Text-heavy
  - Minimalist branding
  - Engagement/Question-based
- **📱 Instagram Preview** - See your posts in a realistic phone mockup
- **⬇️ Easy Downloads** - Download individual posts or all at once
- **🔒 SynthID Watermarking** - AI-generated images include invisible watermarks for safety

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- pip

### Installation

1. **Clone the repository**
   ```bash
   cd /home/pankaj/POC/InstaGenie
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Open your browser**
   Navigate to [http://localhost:5000](http://localhost:5000)

## 🎨 How to Use

1. **Upload Your Logo** - Drag and drop or click to upload your brand logo
2. **Fill Brand Details** - Enter your company name and select your industry
3. **Describe Your Post** - Write what you want your Instagram post to be about
4. **Select Variations** - Choose how many style variations you want (1-5)
5. **Click Magic Generate** - Watch as AI creates your brand-aware posts!

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     InstaGenie POC                          │
├─────────────────────────────────────────────────────────────┤
│  Frontend (HTML/CSS/JS)                                     │
│  ├── Split-screen dashboard layout                          │
│  ├── Drag & drop logo upload                                │
│  ├── Real-time brand color extraction                       │
│  └── Instagram phone mockup preview                         │
├─────────────────────────────────────────────────────────────┤
│  Backend (Flask)                                            │
│  ├── Logo upload handling                                   │
│  ├── Color extraction (ColorThief)                          │
│  ├── Prompt augmentation engine                             │
│  └── Gemini API integration                                 │
├─────────────────────────────────────────────────────────────┤
│  AI Layer (Google Gemini 2.5 Flash)                         │
│  ├── Image generation                                       │
│  ├── Brand-aware prompting                                  │
│  └── SynthID watermarking                                   │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
InstaGenie/
├── app.py                 # Flask backend
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css     # Styling
│   └── js/
│       └── app.js        # Frontend logic
├── uploads/              # Uploaded logos (auto-created)
└── generated/            # Generated images (auto-created)
```

## 🔑 API Configuration

The application uses the Google Gemini API. The API key is configured in `app.py`:

```python
GEMINI_API_KEY = "your-api-key-here"
```

## 🎯 For Demo

This POC demonstrates:

- **Speed**: Gemini 2.5 Flash provides fast generation times
- **Scalability**: Batch generation shows multi-post capability
- **Brand Intelligence**: AI understands and incorporates brand identity
- **Safety**: SynthID watermarking addresses AI ethics concerns
- **User Experience**: Modern, intuitive interface

## 📝 License

This is a proof-of-concept project for demonstration purposes.

---

