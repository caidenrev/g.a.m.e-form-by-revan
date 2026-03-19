'use client'

import { X } from 'lucide-react'

interface TierValidationPopupProps {
  isOpen: boolean
  onClose: () => void
  message: string
  allowedTier?: string
  isGSAOnly?: boolean
  onSelectCorrectTier?: (tier: string) => void
}

export default function TierValidationPopup({ 
  isOpen, 
  onClose, 
  message, 
  allowedTier,
  isGSAOnly,
  onSelectCorrectTier 
}: TierValidationPopupProps) {
  if (!isOpen) return null

  const getTierColor = (tierName: string) => {
    switch(tierName) {
      case 'Rising Star': return 'bg-blue-100 text-blue-600 border-blue-200'
      case 'Achiever': return 'bg-pink-100 text-pink-600 border-pink-200'
      case 'Trailblazer': return 'bg-purple-100 text-purple-600 border-purple-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative border-2 border-orange-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isGSAOnly ? 'bg-blue-100' : 'bg-orange-100'}`}>
            {isGSAOnly ? (
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {isGSAOnly ? 'Informasi GSA' : 'Validasi Tier'}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {allowedTier && onSelectCorrectTier && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
              💡 Disarankan untuk memilih tier yang sesuai:
            </p>
            <div className="flex justify-center">
              <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getTierColor(allowedTier)}`}>
                {allowedTier}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {allowedTier && onSelectCorrectTier && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onSelectCorrectTier(allowedTier)
                  onClose()
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors"
              >
                Pilih {allowedTier}
              </button>
              <button
                onClick={() => {
                  onSelectCorrectTier('')
                  onClose()
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-full font-bold hover:bg-gray-200 transition-colors"
              >
                Kosongkan Tier
              </button>
            </div>
          )}
          
          {isGSAOnly && onSelectCorrectTier && (
            <button
              onClick={() => {
                onSelectCorrectTier('')
                onClose()
              }}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors"
            >
              Kosongkan Tier
            </button>
          )}
          
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-full font-bold hover:bg-gray-200 transition-colors"
          >
            {allowedTier || isGSAOnly ? 'Tutup' : 'Mengerti'}
          </button>
        </div>
      </div>
    </div>
  )
}