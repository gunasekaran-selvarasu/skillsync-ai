import json
import logging
import re
from typing import Dict, Any, Optional
import httpx
from anthropic import Anthropic
from backend.app.core.config import settings

logger = logging.getLogger("skillsync.ai")

class AIOrchestrator:
    def __init__(self):
        self.claude_client = None
        if settings.ANTHROPIC_API_KEY:
            try:
                self.claude_client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            except Exception as e:
                logger.warning(f"Could not initialize Anthropic client: {e}")

    async def query_llm_json(self, prompt: str, system_prompt: str = "", fallback_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Sends prompt to Claude or Ollama and returns parsed JSON.
        If LLM is unavailable or fails, returns reliable fallback data or heuristic parsing.
        """
        # 1. Try Claude if key is provided
        if settings.ANTHROPIC_API_KEY and self.claude_client:
            try:
                response = self.claude_client.messages.create(
                    model=settings.CLAUDE_MODEL,
                    max_tokens=4000,
                    temperature=0.2,
                    system=system_prompt or "You are a helpful AI that strictly outputs valid JSON.",
                    messages=[{"role": "user", "content": prompt}]
                )
                text = response.content[0].text
                parsed = self._extract_json(text)
                if parsed:
                    return parsed
            except Exception as e:
                logger.warning(f"Claude API failed: {e}. Falling back to Ollama or local engine.")

        # 2. Try Local Ollama if running
        if settings.OLLAMA_URL:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        f"{settings.OLLAMA_URL.rstrip('/')}/api/chat",
                        json={
                            "model": settings.OLLAMA_MODEL,
                            "messages": [
                                {"role": "system", "content": system_prompt or "You are an AI assistant that strictly responds in valid JSON."},
                                {"role": "user", "content": prompt}
                            ],
                            "stream": False,
                            "options": {"temperature": 0.2}
                        }
                    )
                    if resp.status_code == 200:
                        content = resp.json().get("message", {}).get("content", "")
                        parsed = self._extract_json(content)
                        if parsed:
                            return parsed
            except Exception as e:
                logger.warning(f"Ollama call failed or not running: {e}")

        # 3. Deterministic Algorithmic Fallback
        logger.info("Using deterministic offline AI fallback generator.")
        return fallback_data or {}

    def _extract_json(self, text: str) -> Optional[Dict[str, Any]]:
        text = text.strip()
        # Look for markdown json block
        match = re.search(r'```(?:json)?\s*(\{.*?\}|\[.*?\])\s*```', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except Exception:
                pass
                
        # Find first '{' and last '}'
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start:end+1])
            except Exception:
                pass
        return None

ai_orchestrator = AIOrchestrator()
