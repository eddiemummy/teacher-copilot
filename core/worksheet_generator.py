from pydantic import BaseModel

from .llm_client import default_llm


class WorksheetRequest(BaseModel):
    level: str
    topic: str
    target_language: str = "tr"  # Çıktı dili (şimdilik TR)


async def generate_worksheet(req: WorksheetRequest) -> str:
    prompt = f"""
Sen Türkçe öğretmeni için worksheet (çalışma kağıdı) hazırlayan bir asistansın.

SEVİYE: {req.level}
KONU: {req.topic}

Bir sayfalık worksheet taslağı üret:
- Başlık
- Kısa konu özeti (2-3 satır)
- 5 örnek cümle
- En az 10 alıştırma (boşluk doldurma, eşleştirme, kısa cevap vb. karışık)
- Sayfanın sonunda cevap anahtarı

Çıktı PDF'e dönüştürmeye uygun, sade bir metin formatında olsun.
"""
    return default_llm.generate(prompt.strip())

