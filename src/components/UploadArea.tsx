import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { parseCsvText } from '../utils/parseCsv';

export default function UploadArea({ onUpload }: { onUpload: (items: { raw: string }[]) => void }) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastUploaded, setLastUploaded] = useState<{ name: string; size: number }[]>([]);

  const openPicker = () => fileRef.current?.click();

  const processFiles = async (files: FileList | null) => {
    if (!files) return;
    const filesArr = Array.from(files);
    const newItems: { raw: string }[] = [];

    for (const file of filesArr) {
      if (file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv' || file.type.startsWith('text/')) {
        const text = await file.text();
        const rows = parseCsvText(text);
        rows.forEach(raw => newItems.push({ raw }));
      } else {
        newItems.push({ raw: `[${file.name}] PDF/unsupported (demo)` });
      }
    }

    if (newItems.length) {
      onUpload(newItems);
      setLastUploaded(filesArr.map(f => ({ name: f.name, size: f.size })));
    }
  };

  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files); };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => { processFiles(e.target.files); e.target.value = ''; };

  return (
    <div>
      <input ref={fileRef} type="file" multiple className="hidden" onChange={onChange} accept=".csv,text/csv,text/plain,.txt,.pdf" />
      <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} className={`border-2 border-dashed rounded-xl p-12 text-center transition ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}>
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Drop CSV files here, or click to browse</p>
        <p className="text-sm text-gray-500">We parse one transaction per line (or CSV with a header). PDF parsing not implemented in demo.</p>
        <div className="mt-4 flex justify-center gap-3">
          <button onClick={openPicker} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Select File</button>
        </div>

        {lastUploaded.length > 0 && (
          <div className="mt-4 text-left max-w-xl mx-auto">
            <p className="text-sm font-medium">Last uploaded files:</p>
            <ul className="list-disc ml-6 text-sm text-gray-600">{lastUploaded.map(f => <li key={f.name}>{f.name} — {(f.size/1024).toFixed(0)} KB</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}
