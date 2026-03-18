'use client'

import { ExternalLink, X, FileImage, ArrowRight } from 'lucide-react'

interface CompressionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileSize: string;
}

export default function CompressionPopup({ isOpen, onClose, fileName, fileSize }: CompressionPopupProps) {
  if (!isOpen) return null

  const handleCompressClick = () => {
    window.open('https://www.iloveimg.com/compress-image', '_blank')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-[32px] shadow-2xl border-4 border-orange-400 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 flex flex-col items-center text-center">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={2} />
          </button>

          {/* Icon */}
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 border-4 border-orange-50">
            <FileImage className="w-10 h-10 text-orange-500" strokeWidth={2} />
          </div>

          <h3 className="text-xl font-extrabold text-gray-800 mb-2 leading-tight">
            File Terlalu Besar!
          </h3>
          
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 w-full">
            <p className="text-sm font-bold text-gray-600 mb-1">File: {fileName}</p>
            <p className="text-sm font-bold text-orange-600">Ukuran: {fileSize}</p>
            <p className="text-xs text-gray-500 mt-2">Maksimal: 1MB</p>
          </div>

          <p className="text-gray-600 font-medium text-sm leading-relaxed mb-6">
            Silakan kompres gambar Anda terlebih dahulu menggunakan tool gratis di bawah ini:
          </p>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            <button
              onClick={handleCompressClick}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-orange-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <span>Kompres Gambar</span>
              <ArrowRight className="w-5 h-5" />
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-2xl transition-all"
            >
              Pilih File Lain
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-2xl w-full">
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              💡 <strong>Tips:</strong> Setelah kompres, download file hasil kompresi dan upload ulang di sini.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}