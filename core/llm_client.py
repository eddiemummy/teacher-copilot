from typing import List, Literal, Optional

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

    def generate(self, prompt: str, images: Optional[List[str]] = None) -> str:
        if self.provider == "openai":
            return self._generate_openai(prompt, images)
        return self._generate_ollama(prompt, images)

    def _generate_ollama(self, prompt: str, images: Optional[List[str]] = None) -> str:
        url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
        }
        # Not using images in the payload anymore, as we use OCR + Text
        try:
            r = requests.post(url, json=payload, timeout=300)
            r.raise_for_status()
            data = r.json()
            return data.get("response", "") or data.get("output", "")
        except Exception as e:
            return f"LLM çağrısı başarısız oldu: {e}"

    def _generate_openai(self, prompt: str, images: Optional[List[str]] = None) -> str:
        import openai

        openai.api_key = os.environ["OPENAI_API_KEY"]
        client = openai.OpenAI()

        messages = []
        if images:
            content = [{"type": "text", "text": prompt}]
            for img in images:
                # Assuming images are already correctly encoded as base64 with data:image/... prefix
                # or just raw base64. OpenAI expects data:image/jpeg;base64,...
                # We'll prepend it if it's missing.
                prefix = "data:image/jpeg;base64," if not img.startswith("data:") else ""
                content.append({
                    "type": "image_url",
                    "image_url": {"url": f"{prefix}{img}"}
                })
            messages.append({"role": "user", "content": content})
        else:
            messages.append({"role": "user", "content": prompt})

        try:
            resp = client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.4,
            )
            return resp.choices[0].message.content or ""
        except Exception as e:
            return f"OpenAI çağrısı başarısız oldu: {e}"


default_llm = LLMClient()

