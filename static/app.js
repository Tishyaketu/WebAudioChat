const CONFIG = {
    API_ENDPOINTS: {
        session: 'http://localhost:8888/session',
        search: 'http://localhost:8888/search',
        realtime: 'https://api.openai.com/v1/realtime'
    },
    MODEL: 'gpt-4o-realtime-preview-2025-06-03',
    VOICE: 'echo',
    INITIAL_MESSAGE: {
        text: 'My name is Geet and I live in New Delhi, India.'
    },
    TOOLS: [
    {
        type: 'function',
        name: 'search_web',
        description: 'Search the web for current information about any topic',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string' }
            },
            required: ['query']
        }
    }],
};

// Interface Management
class InterfaceManager {
    
    static elements = {
        toggleButton: document.getElementById('toggleButton'),
        clearButton: document.getElementById('clearButton'),
        transcript: document.getElementById('transcript'),
        status: document.getElementById('status'),
        error: document.getElementById('error'),
    };

    static updateStatus(message) {
        this.elements.status.textContent = message;
    }

    static showError(message) {
        this.elements.error.style.display = 'block';
        this.elements.error.textContent = message;
    }

    static hideError() {
        this.elements.error.style.display = 'none';
    }

    static updateTranscript(message, type = 'assistant') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `rl-message rl-${type}-message`;
        messageDiv.textContent = message;
        
        if (this.elements.transcript.firstChild) {
            this.elements.transcript.insertBefore(messageDiv, this.elements.transcript.firstChild);
        } else {
            this.elements.transcript.appendChild(messageDiv);
        }
    }

    static clearConversation() {
        this.elements.transcript.innerHTML = '';
        this.hideError();
        this.updateStatus('Ready to start');
    }

    static updateToggleButton(isConnected) {
        const button = this.elements.toggleButton;
        if (isConnected) {
            button.textContent = 'Stop';
            button.className = 'btn';
        } else {
            button.textContent = 'Start';
            button.className = 'btn-accent';
        }
    }

    static updateVoiceSelector(enabled) {
        // Removed: No voice selector functionality
    }
}

// Message Handler
class TranscriptHandler {
    static async handleTranscript(message) {
        const transcript = message.response?.output?.[0]?.content?.[0]?.transcript;
        if (transcript) {
            InterfaceManager.updateTranscript(transcript);
        }
    }

    static async handleWeatherFunction(output) {
        // Removed: No weather-related code
    }

    static async handleSearchFunction(output) {
        try {
            const args = JSON.parse(output.arguments);
            const response = await fetch(`${CONFIG.API_ENDPOINTS.search}/${encodeURIComponent(args.query)}`);
            const data = await response.json();
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'rl-message rl-function-result rl-search';
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'rl-result-title';
            const titleLink = document.createElement('a');
            titleLink.href = data.source;
            titleLink.target = '_blank';
            titleLink.rel = 'noopener noreferrer';
            titleLink.textContent = data.title;
            titleDiv.appendChild(titleLink);
            
            const snippetDiv = document.createElement('div');
            snippetDiv.className = 'rl-result-snippet';
            snippetDiv.textContent = data.snippet;
            
            const sourceDiv = document.createElement('div');
            sourceDiv.className = 'rl-result-source';
            const sourceLink = document.createElement('a');
            sourceLink.href = data.source;
            sourceLink.target = '_blank';
            sourceLink.rel = 'noopener noreferrer';
            sourceLink.textContent = data.source;
            sourceDiv.appendChild(sourceLink);
            
            messageDiv.appendChild(titleDiv);
            messageDiv.appendChild(snippetDiv);
            messageDiv.appendChild(sourceDiv);
            
            if (InterfaceManager.elements.transcript.firstChild) {
                InterfaceManager.elements.transcript.insertBefore(messageDiv, InterfaceManager.elements.transcript.firstChild);
            } else {
                InterfaceManager.elements.transcript.appendChild(messageDiv);
            }
            
            return {
                title: data.title,
                snippet: data.snippet,
                source: data.source,
            };
        } catch (error) {
            AppErrorHandler.handle(error, 'Search Function');
            return "Could not perform search";
        }
    }
}

// WebRTC Manager
class RTCSessionManager {
    constructor(app) {
        this.peerConnection = null;
        this.audioStream = null;
        this.dataChannel = null;
        this.app = app;  // Store reference to the app
    }
    

    async setupAudio() {
        const audioEl = document.createElement('audio');
        audioEl.autoplay = true;
        this.peerConnection.ontrack = e => audioEl.srcObject = e.streams[0];
        
        this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.peerConnection.addTrack(this.audioStream.getTracks()[0]);
    }

    setupDataChannel() {
        this.dataChannel = this.peerConnection.createDataChannel('oai-events');
        this.dataChannel.onopen = () => this.onDataChannelOpen();
        this.dataChannel.addEventListener('message', (event) => this.handleMessage(event));
    }

    async handleMessage(event) {
        try {
            const message = JSON.parse(event.data);
            console.log('Received message:', message);
            
            if (message.type === 'response.done') {
                await TranscriptHandler.handleTranscript(message);
                const output = message.response?.output?.[0];
                if (output?.type === 'function_call' && output?.call_id) {
                    let result;
                    if (output.name === 'search_web') {
                        result = await TranscriptHandler.handleSearchFunction(output);
                    }
                    
                    if (result) {
                        this.sendFunctionOutput(output.call_id, result);
                        this.sendResponseCreate();
                    }
                }
            }
        } catch (error) {
            AppErrorHandler.handle(error, 'Message Processing');
        }
    }

    sendMessage(message) {
        if (this.dataChannel?.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(message));
            console.log('Sent message:', message);
        }
    }

    sendSessionUpdate() {
        this.sendMessage({
            type: "session.update",
            session: {
                voice: CONFIG.VOICE,
                tools: CONFIG.TOOLS,
                tool_choice: "auto"
            }
        });
    }

    sendInitialMessage() {
        this.sendMessage({
            type: 'conversation.item.create',
            previous_item_id: null,
            item: {
                id: 'msg_' + Date.now(),
                type: 'message',
                role: 'user',
                content: [{
                    type: 'input_text',
                    text: CONFIG.INITIAL_MESSAGE.text
                }]
            }
        });
    }

    sendFunctionOutput(callId, data) {
        this.sendMessage({
            type: 'conversation.item.create',
            item: {
                type: 'function_call_output',
                call_id: callId,
                output: JSON.stringify(data)
            }
        });
    }

    sendResponseCreate() {
        this.sendMessage({ type: 'response.create' });
    }

    onDataChannelOpen() {
        this.sendSessionUpdate();
        this.sendInitialMessage();
    }

    cleanup() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
        }
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }
    }
}

// Main Application
class MainApp {
    constructor() {
        this.webrtc = null;
        this.currentVoice = CONFIG.VOICE;
        this.lastQuestion = null;
        this.lastSessionResponse = null;
        this.isConnected = false;
        this.bindEvents();
    }

    bindEvents() {
        InterfaceManager.elements.toggleButton.addEventListener('click', () => this.toggleConnection());
        InterfaceManager.elements.clearButton.addEventListener('click', () => InterfaceManager.clearConversation());
        document.addEventListener('DOMContentLoaded', () => {
            InterfaceManager.updateStatus('Ready to start');
        });
    }

    async toggleConnection() {
        if (this.isConnected) {
            this.stop();
        } else {
            this.start();
        }
    }

    async start() {
        InterfaceManager.elements.toggleButton.disabled = true;
        
        try {
            InterfaceManager.updateStatus('Initializing...');
            const question = CONFIG.INITIAL_MESSAGE.text;
            if (this.lastQuestion === question && this.lastSessionResponse) {
                InterfaceManager.updateStatus('Using cached session');
                this.setupWebRTCWithSession(this.lastSessionResponse);
                return;
            }
            const tokenResponse = await fetch(`${CONFIG.API_ENDPOINTS.session}?voice=${CONFIG.VOICE}&question=${encodeURIComponent(question)}`);
            if (!tokenResponse.ok) {
                throw new Error('Could not establish session');
            }

            const data = await tokenResponse.json();
            if (!data.client_secret?.value) {
                throw new Error('Could not establish session');
            }

            this.lastQuestion = question;
            this.lastSessionResponse = data;
            this.setupWebRTCWithSession(data);
        } catch (error) {
            InterfaceManager.updateToggleButton(false);
            InterfaceManager.elements.toggleButton.disabled = false;
            AppErrorHandler.handle(error, 'Initialization');
            InterfaceManager.updateStatus('Failed to connect');
        }
    }

    setupWebRTCWithSession(data) {
        const EPHEMERAL_KEY = data.client_secret.value;
        this.webrtc = new RTCSessionManager(this);
        this.webrtc.peerConnection = new RTCPeerConnection();
        this.webrtc.setupAudio().then(() => {
            this.webrtc.setupDataChannel();
            this.webrtc.peerConnection.createOffer().then(async (offer) => {
                await this.webrtc.peerConnection.setLocalDescription(offer);
                const sdpResponse = await fetch(`${CONFIG.API_ENDPOINTS.realtime}?model=${CONFIG.MODEL}`, {
                    method: 'POST',
                    body: offer.sdp,
                    headers: {
                        Authorization: `Bearer ${EPHEMERAL_KEY}`,
                        'Content-Type': 'application/sdp'
                    },
                });
                if (!sdpResponse.ok) {
                    throw new Error('Could not establish connection');
                }
                const sdpText = await sdpResponse.text();
                if (!sdpText) {
                    throw new Error('Could not establish connection');
                }
                const answer = {
                    type: 'answer',
                    sdp: sdpText,
                };
                await this.webrtc.peerConnection.setRemoteDescription(answer);
                this.isConnected = true;
                InterfaceManager.updateStatus('Connected');
                InterfaceManager.updateToggleButton(true);
                InterfaceManager.elements.toggleButton.disabled = false;
                InterfaceManager.hideError();
            }).catch((error) => {
                InterfaceManager.updateToggleButton(false);
                InterfaceManager.elements.toggleButton.disabled = false;
                AppErrorHandler.handle(error, 'Initialization');
                InterfaceManager.updateStatus('Failed to connect');
            });
        });
    }

    stop() {
        if (this.webrtc) {
            this.webrtc.cleanup();
            this.webrtc = null;
        }
        this.isConnected = false;
        InterfaceManager.updateToggleButton(false);
        InterfaceManager.updateStatus('Ready to start');
    }
}


// Initialize the application
const app = new MainApp(); 