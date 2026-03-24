from pydantic import BaseModel
from typing import Optional

from .llm_client import default_llm


class SummaryRequest(BaseModel):
    notes: str  # Hocanın ders sonrası notu
    next_topics: Optional[str] = None  # Sonraki ders planı (opsiyonel)
    student_name: Optional[str] = None  # Mesaj kişiselleştirme (opsiyonel)
    level: Optional[str] = None  # Seviye (opsiyonel)
    message_template: Optional[str] = None  # Mesaj şablonu (opsiyonel)
    homework_preferences: Optional[str] = None  # Ödev tercihleri (opsiyonel)
    struggle_areas: Optional[str] = None  # Zorlanılan alanlar (opsiyonel)


async def generate_lesson_summary(req: SummaryRequest) -> str:
    name_line = f"ÖĞRENCİ: {req.student_name}" if req.student_name else ""
    next_line = f"SONRAKİ DERS KONULARI: {req.next_topics}" if req.next_topics else ""
    level_line = f"SEVİYE: {req.level}" if req.level else ""
    template_line = (
        f"MESAJ ŞABLONU: {req.message_template}" if req.message_template else ""
    )
    homework_line = (
        f"ÖDEV TERCİHLERİ: {req.homework_preferences}"
        if req.homework_preferences
        else ""
    )
    struggle_line = (
        f"ZORLANILAN ALANLAR: {req.struggle_areas}"
        if req.struggle_areas
        else ""
    )
    prompt = f"""
Sen Türkçe dersleri için bir özet/rapor asistansın.

DERS NOTU:
{req.notes}

{name_line}
{level_line}
{next_line}
{template_line}
{homework_line}
{struggle_line}

GÖREV:
- Kısa bir ders özeti yaz.
- Öğrenciye gönderilebilecek net bir ödev metni hazırla.
  Ödev metnini varsa "Ödev Tercihleri"ne göre şekillendir.
- Tekrar edilmesi gereken başlıkların bir listesini çıkar.
  Zorlanılan alanlar verilmişse bu listeye mutlaka dahil et.
- Önemli kelime / ifade setini madde madde yaz.
- Öğrenciye kısa, sıcak ve motive edici bir mesaj yaz. Mesajda "Bu derste ..." ve
  "Bir sonraki derste ..." cümleleri geçsin. Sonraki ders konusu verilmişse onu kullan.
  Eğer bir mesaj şablonu verilmişse, tonu ve yapıyı o şablona yaklaştır.

Çıktıyı şu başlıklarla üret:
1) Ders Özeti
2) Öğrenciye Ödev Metni
3) Tekrar Listesi
4) Kelime / İfade Seti
5) Öğrenciye Mesaj
"""
    return default_llm.generate(prompt.strip())
