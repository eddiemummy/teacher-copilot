from pydantic import BaseModel

from .llm_client import default_llm


class WorksheetRequest(BaseModel):
    model: str | None = None
    level: str
    topic: str
    target_language: str = "tr"  # Çıktı dili (şimdilik TR)


async def generate_worksheet(req: WorksheetRequest) -> str:
    prompt = f"""
Rolün: Türk dili öğretiminde uzman bir Türkçe profesörüsün.
Görevin: öğretmenin doğrudan çıktı alıp kullanabileceği, düzenli ve pedagojik bir worksheet hazırlamak.

KALİTE STANDARTLARI:
- Yazım, noktalama ve Türkçe karakter kullanımı kusursuz olmalı.
- İçerik seviyeye uygun, sade ve doğal Türkçe ile yazılmalı.
- Başlık, örnek ve alıştırmalar aynı hedefe hizmet etmeli.
- Alıştırmalar açık, tek anlamlı ve ölçülebilir olmalı.

SEVİYE: {req.level}
KONU: {req.topic}

Bir sayfalık worksheet taslağı üret:
- Başlık
- Kısa konu özeti (2-3 satır)
- 5 örnek cümle
- En az 10 alıştırma (boşluk doldurma, eşleştirme, kısa cevap vb. karışık)
- Sayfanın sonunda cevap anahtarı

Çıktı PDF'e dönüştürmeye uygun, sade bir metin formatında olsun.



CEFR MİKRO-RUBRİK:
- A1: Çok kısa ve temel kalıplar; somut, günlük bağlam; tek adımlı görevler.
- A2: Kısa-orta cümleler; günlük yaşam ve rutin; sınırlı ama çeşitli yapı.
- B1: Biraz daha uzun cümleler; gerekçe/karşılaştırma içeren görevler; kontrollü çeşitlilik.
- B2: Daha akıcı ve doğal söylem; bağlaçlı/çok adımlı görevler; yine de öğretilebilir netlik.

Seviyeye göre uygun kelime yoğunluğu, cümle uzunluğu ve görev zorluğu seç.

EK KURAL:
- Çıktı yalnızca worksheet metni olsun; ek not/açıklama/teori ekleme.
"""
    return default_llm.generate(prompt.strip(), model=req.model)
