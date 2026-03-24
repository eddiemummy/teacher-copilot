from pydantic import BaseModel

from .llm_client import default_llm


class ExerciseRequest(BaseModel):
    level: str  # A1, A2, B1...
    topic: str  # "-iyor şimdiki zaman", "-e/-a yönelme" vb.
    exercise_types: list[str] = ["bosluk_doldurma", "dogru_yanlis", "cumle_kurma"]
    count: int = 10


async def generate_exercises(req: ExerciseRequest) -> str:
    types_str = ", ".join(req.exercise_types)
    prompt = f"""
Sen deneyimli bir Türkçe öğretmenisin. Aşağıdaki bilgilerle alıştırmalar üret.

SEVİYE: {req.level}
KONU: {req.topic}
ALISTIRMA TIPLERI: {types_str}
HEDEF ADET: {req.count}

İSTEK:
- A2 seviyesi için pedagojik olarak temiz, basit ama doğal cümleler kullan.
- Alıştırmaları tip tip böl: 
  1) Boşluk doldurma
  2) Doğru / Yanlış
  3) Cümle kurma
  4) Çeviri (isteğe bağlı)
  5) Eşleştirme (isteğe bağlı)
- Toplamda yaklaşık {req.count} soru üret.
- Sonunda kısa bir cevap anahtarı ekle.

ÇIKTI FORMAT ÖNERİSİ:

### Boşluk Doldurma
1. ...

### Doğru / Yanlış
1. ...

### Cevap Anahtarı
1. ...
"""
    return default_llm.generate(prompt.strip())

