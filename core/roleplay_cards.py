from pydantic import BaseModel

from .llm_client import default_llm


class RoleplayCardsRequest(BaseModel):
    level: str
    scenario: str
    card_count: int = 5


class RoleplayCardsPdfRequest(BaseModel):
    level: str
    scenario: str
    card_count: int = 5
    cards_text: str | None = None


async def generate_roleplay_cards(req: RoleplayCardsRequest) -> str:
    prompt = f"""
Sen deneyimli bir Türkçe öğretmenisin. Aşağıdaki senaryoya uygun rol-play kartları üret.

SEVİYE: {req.level}
SENARYO: {req.scenario}
HEDEF: {req.card_count} kart

ÇIKTI FORMATI:
- Her kartı numaralandır.
- Her kart: Rol / Amaç / Zorunlu ifade (1 kısa cümle)
- Kartlar kısa ve uygulanabilir olsun.
- Metin sadece kartları içersin, başlık yazma.
"""
    return default_llm.generate(prompt.strip())
