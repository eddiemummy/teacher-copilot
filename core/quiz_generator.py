from pydantic import BaseModel

from .llm_client import default_llm


class QuizRequest(BaseModel):
    model: str | None = None
    level: str
    topic: str
    question_count: int = 10
    include_answer_key: bool = True
    student_name: str | None = None


async def generate_quiz(req: QuizRequest) -> str:
    student_line = f"ÖĞRENCİ: {req.student_name}" if req.student_name else ""
    key_line = "Cevap anahtarı ekle." if req.include_answer_key else "Cevap anahtarı ekleme."
    per_type = max(1, req.question_count // 5)
    prompt = f"""
Rolün: Türk dili eğitimi alanında uzman, ölçme-değerlendirme tecrübeli bir Türkçe profesörüsün.
Görevin: Türkçe dil bilgisi ve kullanım yeterliğini güvenilir şekilde ölçen, seviyeye uygun, hatasız bir quiz hazırlamak.

KALİTE STANDARTLARI:
- Türkçe karakterler (ç, ğ, ı, İ, ö, ş, ü), yazım ve noktalama kesinlikle doğru olmalı.
- Her soru tek bir kazanımı ölçmeli; çeldiriciler makul ama net biçimde yanlış olmalı.
- Sorular anlaşılır, kısa ve çift anlamdan uzak olmalı.
- Seviye dışı kelime ve yapı kullanma; zorunluysa kısa bağlamla anlaşılır kıl.
- Aynı kalıp/soru kökünü tekrarlama; çeşitliliği koru.

SEVİYE: {req.level}
KONU: {req.topic}
SORU SAYISI: {req.question_count}
{student_line}

GÖREV:
- Toplam {req.question_count} soru üret.
- Sorular seviyeye uygun, ölçülebilir ve tek doğruya yönlendiren yapıda olmalı.
- Türkçe dil bilgisi kurallarına %100 uygun yaz.
- Her soruda yalnızca tek dil bilgisi hedefi ölç.
- Soru tiplerini aşağıdaki dağılıma göre üret (zorunlu):
  1) Boşluk doldurma
  2) Çoktan seçmeli (A-B-C-D)
  3) Dönüştürme (olumlu→olumsuz, şimdiki→geçmiş, tekil→çoğul vb.)
  4) Cümle kurma (verilen kelimelerle)
  5) Eşleştirme
- Her tipten en az {per_type} soru olmalı. Toplam {req.question_count} soruya tamamla.
- Yönergeler kısa, net ve öğretmenin doğrudan kullanabileceği biçimde olsun.
- {key_line}

KESİN ÇIKTI ŞABLONU (SIRAYLA VE AYNI BAŞLIKLARLA):
1) Başlık (tek satır)
2) Kısa Yönerge (tek paragraf)
3) Bölüm 1: Boşluk Doldurma
4) Bölüm 2: Çoktan Seçmeli (A-B-C-D)
5) Bölüm 3: Dönüştürme
6) Bölüm 4: Cümle Kurma
7) Bölüm 5: Eşleştirme
8) (Varsa) Cevap Anahtarı (numara → doğru cevap)

EK KURAL:
- Çıktıda öğretmene yönelik açıklama notu, teori anlatımı veya çözüm gerekçesi yazma.
- Sadece kullanılabilir quiz metnini ver.
- "Bu soruda...", "Kural:", "Açıklama:" gibi öğretici metin kullanma.
- Her soruyu numaralandır; numaralar 1'den başlayıp kesintisiz devam etsin.
- Çoktan seçmeli sorularda seçenekleri her zaman A), B), C), D) biçiminde ver.
"""
    return default_llm.generate(prompt.strip(), model=req.model)
