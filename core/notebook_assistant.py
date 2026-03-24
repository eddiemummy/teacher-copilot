from pydantic import BaseModel

from .llm_client import default_llm


class NotebookEntry(BaseModel):
    note: str  # Hocanın defterine yazdığı ham not


async def process_notebook_entry(req: NotebookEntry) -> str:
    prompt = f"""
Sen Türkçe öğretmeni için kişisel bir AI asistansın.

DEFTER NOTU:
{req.note}

GÖREV:
- Nottaki problemi veya temayı tespit et.
- Kısa bir mini ders içeriği hazırla.
- Karşılaştırmalı bir tablo ekle (ör. -de/-da vs -den/-dan).
- En az 10 örnek cümle yaz.
- En az 10 alıştırma öner (boşluk doldurma, cümle kurma, çeviri vb.).

TÜM ÇIKTI öğretmenin defterine kolayca kopyalayıp kullanabileceği netlikte olsun.
"""
    return default_llm.generate(prompt.strip())

