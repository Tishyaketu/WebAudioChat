# 🎤 Seamless Audio Chat - Real-time WebRTC Tourism Assistant

A real-time audio chat application powered by OpenAI's GPT-4o Realtime API, specifically designed to provide expert assistance on Indian tourism topics. Built with WebRTC for low-latency audio communication and Flask for backend services.

## ✨ Features

- **Real-time Audio Communication**: Seamless voice interaction using WebRTC technology
- **AI-Powered Tourism Expert**: Specialized in Indian tourism, destinations, and travel information
- **Web Search Integration**: Real-time search capabilities for current tourism data
- **Session Caching**: Intelligent caching for improved performance and reduced API calls
- **Modern UI**: Clean, responsive interface with intuitive controls
- **Error Handling**: Robust error management and user feedback

## 🏗️ Architecture

### Frontend Components
- **InterfaceManager**: Handles UI interactions and DOM manipulation
- **AppErrorHandler**: Centralized error handling and user notifications
- **TranscriptHandler**: Manages conversation display and search results
- **RTCSessionManager**: WebRTC connection management and data channel handling
- **MainApp**: Main application orchestrator

### Backend Services
- **Flask Server**: RESTful API endpoints for session management and search
- **OpenAI Integration**: GPT-4o Realtime API for voice conversations
- **Async HTTP Client**: Non-blocking API calls using httpx
- **Session Caching**: In-memory cache for session optimization

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- OpenAI API Key
- Modern web browser with WebRTC support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd realtime-webrtc2
   ```

2. **Set up virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   Create a `.env` file in the project root:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   REALTIME_SESSION_URL=https://api.openai.com/v1/realtime/sessions
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:8888`

## 🎯 Usage

1. **Start Conversation**: Click the "Start" button to initiate a WebRTC session
2. **Voice Interaction**: Speak naturally about Indian tourism topics
3. **Search Results**: View real-time search results for tourism information
4. **Session Management**: Use "Stop" to end the session or "Clear" to reset the conversation

## 📡 API Endpoints

### Session Management
- `GET /session` - Initialize a new tourism session
  - Query params: `voice`, `question`
  - Returns: Session configuration with client secret

### Search Functionality
- `GET /search/<query>` - Search for tourism information
  - Returns: Structured search results with title, snippet, and source

### Static Files
- `GET /` - Serve the main application interface
- `GET /static/*` - Serve static assets (CSS, JS)

## 🔧 Configuration

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key for GPT-4o Realtime access
- `REALTIME_SESSION_URL`: OpenAI Realtime API endpoint URL

### Application Settings
- **Voice**: Default voice model (currently "echo")
- **Model**: GPT-4o Realtime preview model
- **Tourism Focus**: Restricted to Indian tourism topics only

## 🛠️ Technical Stack

### Frontend
- **HTML5**: Semantic markup with modern structure
- **CSS3**: Custom styling with responsive design
- **JavaScript (ES6+)**: Modular architecture with classes
- **WebRTC**: Real-time audio communication

### Backend
- **Flask**: Lightweight web framework
- **Flask-CORS**: Cross-origin resource sharing
- **httpx**: Async HTTP client for API calls
- **python-dotenv**: Environment variable management

### AI/ML
- **OpenAI GPT-4o Realtime**: Advanced language model for voice conversations
- **Function Calling**: Structured search capabilities

## 🎨 UI Components

### CSS Classes (with `rl-` prefix)
- `rl-message`: Base message styling
- `rl-function-result`: Search result containers
- `rl-result-title`: Search result titles
- `rl-result-snippet`: Search result content
- `rl-result-source`: Source link styling

### Interactive Elements
- Start/Stop buttons for session control
- Clear button for conversation reset
- Real-time status indicators
- Error message display

## 🔒 Security & Performance

### Security Features
- Environment variable protection for API keys
- CORS configuration for secure cross-origin requests
- Input validation and sanitization

### Performance Optimizations
- Session caching to reduce API calls
- Async/await patterns for non-blocking operations
- Efficient DOM manipulation
- WebRTC for low-latency audio

## 🐛 Troubleshooting

### Common Issues
1. **WebRTC not supported**: Ensure you're using a modern browser
2. **Audio permissions**: Allow microphone access when prompted
3. **API key issues**: Verify your OpenAI API key is valid and has Realtime access
4. **CORS errors**: Check that the Flask-CORS configuration is correct

### Debug Mode
Run the application with debug mode enabled:
```bash
python app.py
```
Debug mode provides detailed logging and error information.

## 📝 Development

### Project Structure
```
realtime-webrtc2/
├── app.py              # Flask backend server
├── index.html          # Main application interface
├── requirements.txt    # Python dependencies
├── static/
│   ├── app.js         # Frontend JavaScript
│   └── styles.css     # Application styling
└── README.md          # This file
```

### Code Style
- Python: PEP 8 compliant
- JavaScript: ES6+ with modular classes
- CSS: BEM-like naming with `rl-` prefix

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT-4o Realtime API
- WebRTC community for real-time communication standards
- Flask framework for the robust backend foundation

---

**Note**: This application is specifically designed for Indian tourism assistance. Questions outside this domain will receive a standard response indicating the limitation. 