from pydantic import BaseModel

from .llm_client import default_llm


class QuizRequest(BaseModel):
    level: str
    topic: str
    question_count: int = 10
    include_answer_key: bool = True
    student_name: str | None = None


async def generate_quiz(req: QuizRequest) -> str:
    student_line = f"ÖĞRENCİ: {req.student_name}" if req.student_name else ""
    key_line = "Cevap anahtarı ekle." if req.include_answer_key else "Cevap anahtarı ekleme."
    prompt = f"""
Sen deneyimli bir Türkçe öğretmenisin. Dil bilgisi doğruluğu ve Türkçe karakterler (ç, ğ, ı, İ, ö, ş, ü) kritik.
Amaç: Türkçe dil bilgisi açısından hatasız, ölçülebilir ve seviyeye uygun bir quiz üretmek.

SEVİYE: {req.level}
KONU: {req.topic}
SORU SAYISI: {req.question_count}
{student_line}

GÖREV:
- {req.question_count} soruyu seviyeye uygun üret. Sorular net, tek doğruya yönlendiren ve yanlış anlaşılmaya kapalı olmalı.
- Türkçe dil bilgisi kurallarına %100 uygun yaz. Ekler, ünlü uyumu, sert yumuşama, noktalama ve yazım kurallarını doğru kullan.
- Her soruda sadece tek bir dil bilgisi hedefi olsun (karışık hedef yok).
- Soru tiplerini karıştır ve her tipten en az 1 soru olsun:
  1) Boşluk doldurma
  2) Çoktan seçmeli (A-B-C-D)
  3) Dönüştürme (olumlu→olumsuz, şimdiki→geçmiş, tekil→çoğul vb.)
  4) Cümle kurma (verilen kelimelerle)
  5) Eşleştirme
- Yönergeler kısa ama açık olsun.
- {key_line}

ÇIKTI ŞEKLİ:
1) Başlık (tek satır)
2) Kısa Yönerge (tek paragraf)
3) Sorular (numaralı, her soru ayrı satır)
4) (Varsa) Cevap Anahtarı (numara → doğru cevap)
"""
    return default_llm.generate(prompt.strip())
