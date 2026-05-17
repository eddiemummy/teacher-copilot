from typing import List, Optional

import os
from langchain_ollama import ChatOllama


class LLMClient:
    """
    Çok hafif bir LLM istemcisi.

    - Varsayılan: Ollama (lokal model)
    - Altyapı: langchain_ollama.ChatOllama
    """

    def __init__(
        self,
        model: Optional[str] = None,
    ) -> None:
        self.model = model or os.getenv("OLLAMA_MODEL", "gpt-oss:120b-cloud")
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

    def generate(
        self,
        prompt: str,
        images: Optional[List[str]] = None,
        model: Optional[str] = None,
    ) -> str:
        selected_model = model or self.model
        try:
            llm = ChatOllama(
                model=selected_model,
                base_url=self.base_url,
                temperature=0.4,
            )
            resp = llm.invoke(prompt)
            return getattr(resp, "content", "") or ""
        except Exception as e:
            return f"LLM çağrısı başarısız oldu: {e}"


default_llm = LLMClient()
