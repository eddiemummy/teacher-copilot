import { useEffect, useState, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Note = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
};

const apiBase = "http://localhost:8010";

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function Notebook() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const exec = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
  };

  const exportNote = (type: "pdf" | "md" | "docx") => {
    if (!activeNote) return;
    const { title, content } = activeNote;
    const fileName = (title || "not").replace(/[^a-z0-9]/gi, "_").toLowerCase();

    if (type === "pdf") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
              h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
              .content { margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>${title || "Başlıksız Not"}</h1>
            <div class="content">${content}</div>
            <script>window.onload = () => { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else if (type === "md") {
      let md = `# ${title || "Başlıksız Not"}\n\n`;
      // Very basic HTML to MD
      md += content
        .replace(/<b>(.*?)<\/b>/g, "**$1**")
        .replace(/<i>(.*?)<\/i>/g, "*$1*")
        .replace(/<div>(.*?)<\/div>/g, "\n$1\n")
        .replace(/<br>/g, "\n")
        .replace(/<[^>]*>/g, "");

      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.md`;
      a.click();
    } else if (type === "docx") {
      const header = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${title}</title></head><body>
      `;
      const footer = "</body></html>";
      const sourceHTML = header + `<h1>${title || "Başlıksız Not"}</h1>` + content + footer;

      const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
      const fileDownload = document.createElement("a");
      document.body.appendChild(fileDownload);
      fileDownload.href = source;
      fileDownload.download = `${fileName}.doc`;
      fileDownload.click();
      document.body.removeChild(fileDownload);
    }
  };

  useEffect(() => {
    const fetchNotes = async () => {
      const res = await fetch(
        `${apiBase}/notes?date=${encodeURIComponent(toISODate(selectedDate))}`,
      );
      const data = await res.json();
      setNotes(data.notes || []);
      setActiveNote(data.notes?.[0] ?? null);
    };
    fetchNotes().catch(console.error);
  }, [selectedDate]);

  useEffect(() => {
    if (editorRef.current && activeNote) {
      if (editorRef.current.innerHTML !== activeNote.content) {
        editorRef.current.innerHTML = activeNote.content;
      }
    }
  }, [activeNote?.id]);

  const handleNewNote = () => {
    const base: Note = {
      id: "",
      date: toISODate(selectedDate),
      title: "",
      content: "",
    };
    setActiveNote(base);
  };

  const handleSave = async () => {
    if (!activeNote) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${apiBase}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeNote),
      });
      const data = await res.json();
      setNotes(data.notes);
      const saved = data.notes.find((n: Note) => n.id === data.last_id);
      setActiveNote(saved ?? null);
    } finally {
      setIsSaving(false);
    }
  };

  const insertImage = (base64: string) => {
    const img = `<img src="${base64}" style="max-width: 100%; border-radius: 12px; margin: 10px 0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />`;
    exec("insertHTML", img);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            insertImage(result);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          insertImage(result);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  return (
    <div className="grid grid-cols-[2fr,1fr] bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Not defteri */}
      <div className="flex flex-col border-r border-slate-200">
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center shadow-md transform hover:rotate-6 transition-transform duration-200">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-[0.2em] text-teal-500">
                  Öğretmen Defteri
                </span>
              </div>
            </div>
            <div className="hidden md:block h-8 w-px bg-slate-200" />
            <div className="hidden md:block text-sm font-medium text-slate-700">
              {selectedDate.toLocaleDateString("tr-TR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleNewNote}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Yeni Not
            </button>
            <button
              onClick={handleSave}
              disabled={!activeNote || isSaving}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
            >
              {isSaving ? "..." : "Kaydet"}
            </button>
            {activeNote?.id && (
              <div className="relative group">
                <button className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-300 bg-white hover:bg-slate-50 shadow-sm flex items-center gap-2">
                  Dışa Aktar
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button onClick={() => exportNote("pdf")} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 flex items-center gap-2">
                    📄 PDF Olarak İndir
                  </button>
                  <button onClick={() => exportNote("md")} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 flex items-center gap-2">
                    📝 Markdown (MD)
                  </button>
                  <button onClick={() => exportNote("docx")} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 flex items-center gap-2">
                    📽 Word (DOCX)
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          {activeNote ? (
            <div className="max-w-3xl mx-auto flex flex-col gap-4">
              <input
                className="text-2xl font-semibold bg-transparent border-none outline-none placeholder:text-slate-400"
                placeholder="Ders / öğrenci notu başlığı..."
                value={activeNote.title}
                onChange={(e) =>
                  setActiveNote({ ...activeNote, title: e.target.value })
                }
              />
              <div className="flex flex-wrap items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm sticky top-0 z-10 w-full">
                <div className="relative group">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 font-bold text-[10px] uppercase">
                    H <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                  <div className="absolute left-0 top-full mt-1 w-24 bg-white border border-slate-200 rounded-xl shadow-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <button onClick={() => exec("formatBlock", "H1")} className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-slate-50">H1 Başlık</button>
                    <button onClick={() => exec("formatBlock", "H2")} className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-slate-50">H2 Alt Başlık</button>
                    <button onClick={() => exec("formatBlock", "H3")} className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-slate-50">H3 Küçük</button>
                    <button onClick={() => exec("formatBlock", "H4")} className="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-slate-50">H4 Çok Küçük</button>
                    <button onClick={() => exec("formatBlock", "P")} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50">Normal Metin</button>
                  </div>
                </div>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <button onClick={() => exec("bold")} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Kalın"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg></button>
                <button onClick={() => exec("italic")} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="İtalik"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg></button>
                <button onClick={() => exec("underline")} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Altı Çizili"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M6 3v7a6 6 0 0 0 12 0V3" /><line x1="4" y1="21" x2="20" y2="21" /></svg></button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <button onClick={() => exec("insertUnorderedList")} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Madde İşaretli Liste"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg></button>
                <button onClick={() => exec("insertOrderedList")} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Numaralı Liste"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg></button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <button onClick={() => exec("justifyLeft")} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg></button>
                <button onClick={() => exec("justifyCenter")} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></svg></button>
                <button onClick={() => exec("justifyFull")} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="21" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="3" y2="18" /></svg></button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <select onChange={(e) => exec("fontSize", e.target.value)} className="text-[10px] bg-transparent outline-none p-1 font-bold uppercase cursor-pointer">
                  <option value="3">Metin Boyutu</option>
                  <option value="1">Çok Küçük</option>
                  <option value="2">Küçük</option>
                  <option value="3">Orta</option>
                  <option value="4">Büyük</option>
                  <option value="5">Çok Büyük</option>
                  <option value="6">Dev</option>
                </select>
                <input type="color" onChange={(e) => exec("foreColor", e.target.value)} className="w-6 h-6 border-none bg-transparent cursor-pointer p-0" title="Renk" />
              </div>

              <div
                ref={editorRef}
                contentEditable
                className="min-h-[400px] bg-white rounded-3xl border border-slate-200 px-8 py-8 text-sm leading-relaxed outline-none shadow-sm focus:ring-2 focus:ring-teal-100 transition-all doc-modern"
                onInput={(e) =>
                  setActiveNote({ ...activeNote, content: e.currentTarget.innerHTML })
                }
                onPaste={handlePaste}
              />

              <div className="mt-4 flex flex-col gap-3">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Görsel / Ekran Görüntüsü
                </div>
                <label className="flex items-center gap-3 w-full px-5 py-3 rounded-2xl border-2 border-dashed border-slate-200 text-xs font-bold text-slate-500 cursor-pointer bg-white hover:bg-slate-50 hover:border-teal-300 transition-all group">
                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-400 group-hover:text-teal-500">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <span>Görsel Türünde Dosya Seç (veya buraya yapıştır)</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <p className="text-[10px] text-slate-400 px-1 italic">
                  * Clipboard'daki ekran görüntülerini doğrudan yazı alanına yapıştırabilirsin.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 animate-in fade-in zoom-in duration-500">
              <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center shadow-inner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-slate-300">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">
                  Bu gün için not yok
                </p>
                <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
                  Sol üstten "Yeni Not" butonuna tıklayarak <span className="font-bold underline decoration-teal-400 decoration-2">başlayın.</span>
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Takvim + not listesi */}
      <aside className="bg-white flex flex-col gap-4 p-4">
        <div className="rounded-2xl border border-slate-200 shadow-sm bg-slate-50 p-3">
          <Calendar
            onChange={(value) => setSelectedDate(value as Date)}
            value={selectedDate}
          />
        </div>

        <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 overflow-y-auto">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">
            Bugünkü Notlar
          </div>
          {notes.length === 0 ? (
            <p className="text-xs text-slate-400">
              Bu tarih için kayıtlı not yok.
            </p>
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => (
                <li key={note.id}>
                  <button
                    onClick={() => setActiveNote(note)}
                    className={`w-full text-left rounded-2xl border transition-all px-4 py-3 group ${activeNote?.id === note.id
                      ? "border-teal-400 bg-teal-50/50 shadow-sm"
                      : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                  >
                    <div className="text-xs font-bold text-slate-800 truncate mb-1">
                      {note.title || "Başlıksız not"}
                    </div>
                    <div className="text-[10px] leading-relaxed text-slate-400 line-clamp-2">
                      {stripHtml(note.content) || "İçerik yok..."}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

