'use client'

import { X } from 'lucide-react'

interface GsaRejectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GsaRejectionPopup({ isOpen, onClose }: GsaRejectionPopupProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-red-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-[32px] shadow-2xl border-4 border-red-500 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 flex flex-col items-center text-center">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={3} />
          </button>

          {/* Icon/Decoration */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 border-4 border-red-50">
             <img src="/images/site-icon.png" alt="GSA" className="w-12 h-12 grayscale opacity-50" />
          </div>

          <h3 className="text-xl font-black text-red-600 mb-4 leading-tight uppercase tracking-tighter">
            DIH BUKAN GSA 25 YA?
          </h3>
          
          <p className="text-gray-600 font-bold text-sm leading-relaxed px-2">
            GA BISA JOIN SIRKEL KITA DULU YA KA... <br />
            <span className="text-red-400">MAAF HEHE</span>
          </p>

          <button
            onClick={onClose}
            className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-200 transition-all hover:scale-[1.02] active:scale-95 text-sm tracking-widest uppercase"
          >
            OKE DEH...
          </button>
        </div>
      </div>
    </div>
  )
}
