'use client'

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPopup({ isOpen, onClose }: LoginPopupProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 transition-all">
      <div 
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm relative overflow-hidden animate-in zoom-in-95 duration-300 border border-blue-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with icon/header styling */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 w-full" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 z-50"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-4">Informasi Penting</h3>
          
          <p className="text-[#475467] font-medium leading-relaxed">
            halo, kalo kena alert abis login berati web nya masih dalam tinjauan google ya, data kamu akan aman karna di secure di google cloud :) makasii
          </p>
          
          <button
            onClick={onClose}
            className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  )
}
