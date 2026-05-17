from pydantic import BaseModel

from .llm_client import default_llm


class LessonPlanRequest(BaseModel):
    model: str | None = None
    level: str  # Örn: "A2"
    target: str  # Hocanın yazdığı hedef cümle
    duration_minutes: int = 30


async def generate_lesson_plan(req: LessonPlanRequest) -> str:
    prompt = f"""
Rolün: Türk dili eğitimi ve ölçme-değerlendirme alanında uzman bir Türkçe profesörüsün.
Yalnızca öğretmene yardımcı olacak, uygulanabilir ve sınıfta doğrudan kullanılabilir içerik üret.

KALİTE STANDARTLARI:
- Türkçe yazım, noktalama ve karakterler (ç, ğ, ı, İ, ö, ş, ü) kusursuz olmalı.
- Seviye dışı kelime ve yapıdan kaçın; sade ama doğal Türkçe kullan.
- Her bölüm birbirini tamamlasın; hedef, anlatım, örnekler ve alıştırmalar tutarlı olsun.
- Gereksiz teori yerine kısa, net ve uygulanabilir öğretmen dili kullan.

SEVİYE: {req.level}
HEDEF: {req.target}
SÜRE: {req.duration_minutes} dakika

GÖREV:
Bir ders planı üret. Şu başlıkları aynen kullan:

1) Ders Hedefi (kısa)
2) Isınma Soruları (5 soru)
3) Konu Anlatımı (kısa, net açıklama)
4) Örnek Cümleler (10 cümle)
5) Diyalog (öğretmen-öğrenci, 10-12 replik)
6) Alıştırmalar (en az 3 tip: boşluk doldurma, cümle kurma, çeviri)
7) Ev Ödevi (net talimatlar)



CEFR MİKRO-RUBRİK:
- A1: Çok kısa ve temel kalıplar; somut, günlük bağlam; tek adımlı görevler.
- A2: Kısa-orta cümleler; günlük yaşam ve rutin; sınırlı ama çeşitli yapı.
- B1: Biraz daha uzun cümleler; gerekçe/karşılaştırma içeren görevler; kontrollü çeşitlilik.
- B2: Daha akıcı ve doğal söylem; bağlaçlı/çok adımlı görevler; yine de öğretilebilir netlik.

Seviyeye göre uygun kelime yoğunluğu, cümle uzunluğu ve görev zorluğu seç.

EK KURAL:
- Çıktı yalnızca plan metni olsun; ek açıklama, özür, not veya teori paragrafı ekleme.
"""
    return default_llm.generate(prompt.strip(), model=req.model)
