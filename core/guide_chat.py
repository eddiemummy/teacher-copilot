from typing import List, Literal, Optional

from pydantic import BaseModel

from core.llm_client import default_llm


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class GuideChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None


SYSTEM_PROMPT = """Sen "Socrates" adında bilge bir rehbersin.
Hedefin, Türkçe öğretmenlerine pratik, uygulanabilir ve net öneriler vermek.

Yanıt biçimi:
- Basit soru: 2-5 cümleyle doğrudan cevap.
- Uygulama isteyen soru: kısa öneriler + gerekirse 3-5 maddelik plan.
- Kullanıcı plan isterse: net, kısa ve adım adım plan ver.

Kurallar:
- Her zaman plan çıkarmak zorunda değilsin.
- Belirsiz isteklerde en fazla 1 net soru sor.
- Gereksiz teoriye girme; örnek ve uygulanabilirlik öncelikli olsun.
- Ton: destekleyici, öğretmen koçu gibi, net ve nazik."""


def _format_history(history: List[ChatMessage]) -> str:
    lines = []
    for msg in history:
        speaker = "Öğretmen" if msg.role == "user" else "Socrates"
        lines.append(f"{speaker}: {msg.content}")
    return "\n".join(lines)


async def generate_guide_reply(req: GuideChatRequest) -> str:
    history = req.history or []
    trimmed = history[-8:]
    history_block = _format_history(trimmed)
    prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        "SOHBET:\n"
        f"{history_block}\n"
        f"Öğretmen: {req.message}\n"
        "Socrates:"
    )
    return default_llm.generate(prompt.strip())
