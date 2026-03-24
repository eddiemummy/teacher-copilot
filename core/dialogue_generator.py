from pydantic import BaseModel

from .llm_client import default_llm


class DialogueRequest(BaseModel):
    level: str  # A1, A2...
    topic: str  # "yönelme eki -e/-a", "alışveriş diyaloğu" vb.
    example_count: int = 20


async def generate_dialogue(req: DialogueRequest) -> str:
    prompt = f"""
Sen deneyimli bir Türkçe öğretmenisin. Aşağıdaki konu için örnek cümleler ve diyalog üret.

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
"""
    return default_llm.generate(prompt.strip())

