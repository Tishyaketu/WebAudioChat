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

@app.route("/session", methods=["GET"])
def initiate_tourism_session():
    # Always use the default voice
    voice = "echo"
    question = request.args.get("question", None)
    cache_key = generate_session_fingerprint(voice, question or "")
    if question and cache_key in session_cache:
        logger.info(f"Cache hit for voice={voice}, question={question}")
        return jsonify(session_cache[cache_key])
    try:
        async def async_retrieve_session():
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    REALTIME_SESSION_URL,
                    headers={
                        'Authorization': f'Bearer {OPENAI_API_KEY}',
                        'Content-Type': 'application/json'
                    },
                    json={
                        "model": "gpt-4o-realtime-preview-2025-06-03",
                        "voice": voice,
                        "instructions": """
                        You are an expert assistant who ONLY answers questions about Indian tourism (such as destinations, travel, statistics, best times to visit, sites, etc.).
                        If the user's question is NOT about Indian tourism, reply exactly with: 'I can not reply to this question'.
                        Never answer in markdown format. Plain text only with no markdown. Also repsond in English unless specifically asked to respond in another language.
                        """
                    }
                )
                response.raise_for_status()
                result = response.json()
                if question:
                    session_cache[cache_key] = result
                return result
        import asyncio
        result = asyncio.run(async_retrieve_session())
        return jsonify(result)
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error occurred: {e.response.status_code}")
        return jsonify({"error": str(e)}), e.response.status_code
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8888, debug=True) 