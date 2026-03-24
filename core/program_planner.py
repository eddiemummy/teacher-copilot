from typing import Optional

from pydantic import BaseModel

from .llm_client import default_llm


class ProgramPlanRequest(BaseModel):
    level: str  # Örn: "A2"
    native_language: str  # Öğrencinin anadili
    weekly_lessons: int  # Haftalık ders sayısı
    target: str  # Öğrencinin hedefi
    lesson_duration_minutes: int = 60
    learner_needs: Optional[str] = None  # Örn: "konuşma ağırlıklı"
    assessment_note: Optional[str] = None  # Öğrenciye dair ölçme notu


async def generate_program_plan(req: ProgramPlanRequest) -> str:
    needs_line = f"İHTİYAÇLAR: {req.learner_needs}" if req.learner_needs else ""
    assessment_line = (
        f"ÖLÇME NOTU: {req.assessment_note}" if req.assessment_note else ""
    )
    prompt = f"""
Sen deneyimli bir Türkçe öğretmenisin ve öğretmene program tasarlıyorsun.

SEVİYE: {req.level}
ANADİL: {req.native_language}
HAFTALIK DERS SAYISI: {req.weekly_lessons}
DERS SÜRESİ: {req.lesson_duration_minutes} dakika
HEDEF: {req.target}
{needs_line}
{assessment_line}

GÖREV:
1) Öğrenci profiline göre 8-12 haftalık bir ders programı öner.
   - Hafta hafta konu başlıkları ver.
   - Haftalık ders sayısına göre her hafta için 1-2 alt başlık ekle.
2) "Müfredat / konu sıralaması" için farklı yaklaşımlara göre kısa taslak ver:
   - İletişimsel yaklaşım
   - Görev temelli yaklaşım
   - Dilbilgisi odaklı yaklaşım
   - Spiral (tekrar eden) yaklaşım
3) Anadile bağlı olası zorlukları ve ipuçlarını 4-6 maddeyle özetle.

Not: Bu çıktı resmi bir müfredat değil, öğretmene yardımcı olacak esnek bir taslaktır.

Çıktıyı şu başlıklarla üret:
1) Program (Hafta Hafta)
2) Müfredat Taslakları (Yaklaşımlara Göre)
3) Anadile Göre Zorluklar / İpuçları
"""
    return default_llm.generate(prompt.strip())
