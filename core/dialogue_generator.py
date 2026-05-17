from pydantic import BaseModel

from .llm_client import default_llm


class DialogueRequest(BaseModel):
    model: str | None = None
    level: str  # A1, A2...
    topic: str  # "yönelme eki -e/-a", "alışveriş diyaloğu" vb.
    example_count: int = 20


async def generate_dialogue(req: DialogueRequest) -> str:
    prompt = f"""
Rolün: Türk dili öğretimi uzmanı bir Türkçe profesörüsün.
Görevin: verilen konu için seviye uyumlu, doğal ve pedagojik olarak güçlü örnek cümleler ve diyalog üretmek.

KALİTE STANDARTLARI:
- Türkçe yazım, noktalama ve ek kullanımı hatasız olmalı.
- Cümleler kısa, anlaşılır, günlük hayata uygun ve yapaylıktan uzak olmalı.
- Aynı kalıbı tekrar etme; bağlam çeşitliliği sun.
- Seviye dışına taşan karmaşık yapılardan kaçın.

SEVİYE: {req.level}
KONU: {req.topic}
HEDEF: {req.example_count} örnek cümle + 1 diyalog

ÇIKTI:
1) Numara verilmiş {req.example_count} örnek cümle (sade, doğal, seviyeye uygun)
2) En az 10-12 replikten oluşan bir diyalog

İLK KISIM (ÖRNEKLER):
- Her cümleyi numaralandır.
- Aynı yapıyı tekrar tekrar değil, ufak bağlam farklarıyla kullan.

İKİNCİ KISIM (DIYALOG):
- Öğretmen ve öğrenci konuşması gibi olsun.
- Doğru kullanımı doğal bağlam içinde göster.
- Açıkça gramer anlatma, sadece doğru kullanımı örnekle.



CEFR MİKRO-RUBRİK:
- A1: Çok kısa ve temel kalıplar; somut, günlük bağlam; tek adımlı görevler.
- A2: Kısa-orta cümleler; günlük yaşam ve rutin; sınırlı ama çeşitli yapı.
- B1: Biraz daha uzun cümleler; gerekçe/karşılaştırma içeren görevler; kontrollü çeşitlilik.
- B2: Daha akıcı ve doğal söylem; bağlaçlı/çok adımlı görevler; yine de öğretilebilir netlik.

Seviyeye göre uygun kelime yoğunluğu, cümle uzunluğu ve görev zorluğu seç.

EK KURAL:
- Yalnızca istenen içerikleri üret; ekstra açıklama veya teori ekleme.
"""
    return default_llm.generate(prompt.strip(), model=req.model)
