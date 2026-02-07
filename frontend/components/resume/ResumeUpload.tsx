import { useRef, useState } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ResumeUploadProps {
    resumeText: string;
    setResumeText: (text: string) => void;
    isExtracting: boolean;
    setIsExtracting: (val: boolean) => void;
}

export default function ResumeUpload({ resumeText, setResumeText, isExtracting, setIsExtracting }: ResumeUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error("Please upload a PDF file.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size exceeds 2MB limit.");
            return;
        }

        setIsExtracting(true);
        try {
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const typedarray = new Uint8Array(reader.result as ArrayBuffer);
                    const loadingTask = pdfjsLib.getDocument({ data: typedarray });
                    const pdf = await loadingTask.promise;
                    let fullText = "";

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map((item: any) => (item as any).str).join(" ");
                        fullText += pageText + "\n";
                    }

                    setResumeText(fullText.trim());
                    setIsExtracting(false);
                    toast.success("Resume text extracted successfully!");
                } catch (innerErr) {
                    console.error("PDF Parsing error", innerErr);
                    toast.error("Error parsing PDF structure.");
                    setIsExtracting(false);
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (err) {
            console.error("PDF library load error", err);
            toast.error("Failed to load PDF processing library.");
            setIsExtracting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pl-1">
                <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Resume Content</label>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] text-amber-500 font-black uppercase tracking-widest hover:underline flex items-center gap-1"
                >
                    <Upload className="w-3 h-3" /> Upload PDF
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf"
                    className="hidden"
                />
            </div>
            <div className="relative group">
                <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume content here or upload a PDF above..."
                    className={`w-full h-64 bg-black border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:border-amber-500 outline-none resize-none transition-all ${isExtracting ? 'opacity-50' : ''}`}
                />
                {isExtracting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl backdrop-blur-[2px]">
                        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl shadow-2xl">
                            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                            <span className="text-xs font-bold text-white">Extracting from PDF...</span>
                        </div>
                    </div>
                )}
                {resumeText && !isExtracting && (
                    <button
                        onClick={() => setResumeText('')}
                        className="absolute top-4 right-4 p-2 bg-zinc-800/80 rounded-lg text-zinc-500 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
