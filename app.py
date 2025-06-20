from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import httpx
import os
from dotenv import load_dotenv
import logging
import hashlib

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
logger.info("Logging is set up.")

app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app)

# Load environment variables
load_dotenv(override=True)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
REALTIME_SESSION_URL = os.getenv("REALTIME_SESSION_URL")

logger.info(f"REALTIME_SESSION_URL: {REALTIME_SESSION_URL}")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment variables")
if not REALTIME_SESSION_URL:
    raise ValueError("REALTIME_SESSION_URL not found in environment variables")

# Simple in-memory cache for session responses
session_cache = {}

def generate_session_fingerprint(voice: str, question: str) -> str:
    return hashlib.sha256(f"{voice}:{question}".encode()).hexdigest()

@app.route("/")
def deliver_homepage():
    return send_from_directory('.', 'index.html')
