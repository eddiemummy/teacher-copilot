from pydantic import BaseModel

from .llm_client import default_llm


class DialogueExercisesRequest(BaseModel):
    level: str
    dialogue: str
    include_key: bool = False


async def generate_dialogue_exercises(req: DialogueExercisesRequest) -> str:
    key_line = "4) Cevap Anahtari (sadece numaralari listele)" if req.include_key else ""
    key_rule = "- Cevap anahtari sadece dogru cevaplari numara bazli listelemeli." if req.include_key else ""

    prompt = f"""
Sen deneyimli bir Türkçe öğretmenisin. Aşağıdaki diyaloğu alıştırmaya dönüştür.

SEVİYE: {req.level}
DIYALOG:
{req.dialogue}

ÇIKTI:
1) Boşluk doldurma (6 soru)
2) Doğru/Yanlış (6 ifade)
3) Rol-play görevleri (3 kısa görev)
{key_line}

Kurallar:
- Sorular net ve kısa olsun.
- Doğru/yanlış ifadeleri diyaloğa dayansın.
- Başlık ve gereksiz açıklama yazma.
{key_rule}
"""
    return default_llm.generate(prompt.strip())
