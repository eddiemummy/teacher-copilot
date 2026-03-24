from pydantic import BaseModel

from .llm_client import default_llm


class LessonPlanRequest(BaseModel):
    level: str  # Örn: "A2"
    target: str  # Hocanın yazdığı hedef cümle
    duration_minutes: int = 30


async def generate_lesson_plan(req: LessonPlanRequest) -> str:
    prompt = f"""
Sen deneyimli bir Türkçe öğretmenisin ve yalnızca öğretmene yardımcı oluyorsun.

SEVİYE: {req.level}
HEDEF: {req.target}
SÜRE: {req.duration_minutes} dakika

Bir ders planı üret. Şu başlıkları kullan:

1) Ders Hedefi (kısa)
2) Isınma Soruları (5 soru)
3) Konu Anlatımı (kısa, net açıklama)
4) Örnek Cümleler (10 cümle)
5) Diyalog (öğretmen-öğrenci, 10-12 replik)
6) Alıştırmalar (en az 3 tip: boşluk doldurma, cümle kurma, çeviri)
7) Ev Ödevi (net talimatlar)

Her şeyi A2 seviyesine uygun, sade ama doğal Türkçe ile yaz.
Öğrenci değil, öğretmen okuyacak; açıklamalarını hocaya hitap eder gibi yaz.
"""
    return default_llm.generate(prompt.strip())

