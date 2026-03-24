from typing import Optional

from pydantic import BaseModel

from .llm_client import default_llm


class ScenarioDialogueRequest(BaseModel):
    level: str
    scenario: str
    turn_count: int = 12
    avoid: Optional[str] = None
    variation_token: Optional[str] = None


async def generate_scenario_dialogue(req: ScenarioDialogueRequest) -> str:
    avoid_block = (
        f"\nÖNCEKİ YANIT (TEKRARLAMA / BENZERİ OLMASIN):\n{req.avoid}\n"
        if req.avoid
        else ""
    )
    variation = f"\nVARYASYON ANAHTARI: {req.variation_token}\n" if req.variation_token else ""

    prompt = f"""
Sen deneyimli bir Türkçe öğretmenisin. Aşağıdaki gerçek hayat senaryosu için doğal,
seviyeye uygun bir diyalog üret.

SEVİYE: {req.level}
SENARYO: {req.scenario}
HEDEF: En az {req.turn_count} replik (kısa, konuşma dili, pratik)
KURALLAR:
- Metin sadece diyaloğu içersin, başlık veya açıklama yazma.
- Farklı karakter isimleri kullan (2-3 kişi).
- Aynı kalıpları tekrarlama; çeşitli ifade biçimleri kullan.
- Bir önceki yanıttan farklı olsun; farklı bağlam/karakter/ifade seç.
- Eğer önceki yanıt verilmişse, aynı cümleleri veya çok benzer ifadeleri kullanma.
{variation}{avoid_block}
"""
    return default_llm.generate(prompt.strip())
