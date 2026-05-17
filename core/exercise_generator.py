from pydantic import BaseModel

from .llm_client import default_llm


class ExerciseRequest(BaseModel):
    model: str | None = None
    level: str  # A1, A2, B1...
    topic: str  # "-iyor şimdiki zaman", "-e/-a yönelme" vb.
    exercise_types: list[str] = ["bosluk_doldurma", "dogru_yanlis", "cumle_kurma"]
    count: int = 10


async def generate_exercises(req: ExerciseRequest) -> str:
    types_str = ", ".join(req.exercise_types)
    prompt = f"""
Rolün: Türk dili eğitimi alanında uzman bir Türkçe profesörüsün.
Görevin: öğretmenin sınıfta doğrudan kullanabileceği, ölçülebilir ve seviye uyumlu alıştırmalar üretmek.

KALİTE STANDARTLARI:
- Türkçe dil bilgisi, yazım ve noktalama kuralları kusursuz olmalı.
- Her soru tek bir hedefe odaklansın; belirsiz/çift anlamlı ifade kullanma.
- Çeldiriciler ve yanlış seçenekler mantıklı ama açıkça yanlış olmalı.
- Cümleler kısa, doğal ve öğrencinin seviyesine uygun olsun.

SEVİYE: {req.level}
KONU: {req.topic}
ALISTIRMA TIPLERI: {types_str}
HEDEF ADET: {req.count}

İSTEK:
- Seviyeye uygun, pedagojik olarak temiz ve doğal cümleler kullan.
- Alıştırmaları tip tip böl: 
  1) Boşluk doldurma
  2) Doğru / Yanlış
  3) Cümle kurma
  4) Çeviri (isteğe bağlı)
  5) Eşleştirme (isteğe bağlı)
- Toplamda yaklaşık {req.count} soru üret (mümkün olduğunca dengeli dağılım).
- Sonunda kısa bir cevap anahtarı ekle.

ÇIKTI FORMAT ÖNERİSİ:

### Boşluk Doldurma
1. ...

### Doğru / Yanlış
1. ...

### Cevap Anahtarı
1. ...



CEFR MİKRO-RUBRİK:
- A1: Çok kısa ve temel kalıplar; somut, günlük bağlam; tek adımlı görevler.
- A2: Kısa-orta cümleler; günlük yaşam ve rutin; sınırlı ama çeşitli yapı.
- B1: Biraz daha uzun cümleler; gerekçe/karşılaştırma içeren görevler; kontrollü çeşitlilik.
- B2: Daha akıcı ve doğal söylem; bağlaçlı/çok adımlı görevler; yine de öğretilebilir netlik.

Seviyeye göre uygun kelime yoğunluğu, cümle uzunluğu ve görev zorluğu seç.

EK KURAL:
- Çıktı sadece alıştırma metni olsun; öğretmene ek açıklama/not ekleme.
"""
    return default_llm.generate(prompt.strip(), model=req.model)
