from typing import Literal, Optional

import os
import requests


Provider = Literal["ollama", "openai"]


class LLMClient:
    """
    Çok hafif bir LLM istemcisi.

    - Varsayılan: Ollama (lokal model)
    - İstersen: OPENAI_API_KEY tanımlayıp OpenAI'ye geçebilirsin.
    """

    def __init__(
        self,
        provider: Optional[Provider] = None,
        model: Optional[str] = None,
    ) -> None:
        self.provider: Provider = provider or (
            "openai" if os.getenv("OPENAI_API_KEY") else "ollama"
        )
        self.model = model or (
            os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            if self.provider == "openai"
            else os.getenv("OLLAMA_MODEL", "gpt-oss:120b-cloud")
        )

    def generate(self, prompt: str) -> str:
        if self.provider == "openai":
            return self._generate_openai(prompt)
        return self._generate_ollama(prompt)

    def _generate_ollama(self, prompt: str) -> str:
        url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
        }
        try:
            r = requests.post(url, json=payload, timeout=300)
            r.raise_for_status()
            data = r.json()
            # ollama generate format
            return data.get("response", "") or data.get("output", "")
        except Exception as e:
            return f"LLM çağrısı başarısız oldu: {e}"

    def _generate_openai(self, prompt: str) -> str:
        import openai

        openai.api_key = os.environ["OPENAI_API_KEY"]
        client = openai.OpenAI()
        try:
            resp = client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4,
            )
            return resp.choices[0].message.content or ""
        except Exception as e:
            return f"OpenAI çağrısı başarısız oldu: {e}"


default_llm = LLMClient()

