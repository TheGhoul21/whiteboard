import React, { useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { Upload } from 'lucide-react';
import type { ImageObj } from '../types';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFImporterProps {
  onImport: (images: ImageObj[]) => void;
}

export const PDFImporter: React.FC<PDFImporterProps> = ({ onImport }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      const newImages: ImageObj[] = [];
      const GAP = 50;
      let currentY = 0;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 }); // High res for zooming
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        } as any).promise;

        const base64 = canvas.toDataURL('image/jpeg');
        
        // Calculate dynamic width based on screen size (approx 50% of screen width)
        const screenWidth = window.innerWidth;
        const targetWidth = screenWidth * 0.5;
        const scaleFactor = targetWidth / viewport.width;
        const targetHeight = viewport.height * scaleFactor;

        newImages.push({
           id: `pdf-${Date.now()}-${i}`,
           type: 'image',
           src: base64,
           x: 0,
           y: currentY,
           width: targetWidth,
           height: targetHeight,
        });

        currentY += targetHeight + GAP;
      }

      onImport(newImages);
      if (inputRef.current) inputRef.current.value = ''; // Reset
    } catch (err) {
      console.error("PDF Import Error:", err);
      alert("Failed to load PDF");
    }
  };

  return (
    <>
      <button 
         onClick={() => inputRef.current?.click()}
         className="p-2 text-gray-700 hover:bg-gray-100 rounded" 
         title="Import PDF"
      >
         <Upload size={20} />
      </button>
      <input 
         ref={inputRef} 
         type="file" 
         accept=".pdf" 
         className="hidden" 
         onChange={handleFile}
      />
    </>
  );
};
