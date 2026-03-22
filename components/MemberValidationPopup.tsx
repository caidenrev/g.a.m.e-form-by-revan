'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface MemberValidationPopupProps {
  isOpen: boolean
  onClose: () => void
  errors: string[]
  suggestions: {
    name?: string
    campus?: string
  }
  onAcceptSuggestions: (suggestions: { name?: string; campus?: string }) => void
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function MemberValidationPopup({ 
  isOpen, 
  onClose, 
  errors, 
  suggestions,
  onAcceptSuggestions 
}: MemberValidationPopupProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Kombinasi Data Tidak Sesuai
          </h3>
          
          <div className="text-left mb-4">
            <p className="text-sm text-gray-600 mb-3">
              Kombinasi GSA ID, nama, dan kampus yang Anda masukkan tidak sesuai dengan database member GSA.
            </p>
            
            <div className="p-3 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm text-red-700 font-medium">
                Semua data harus cocok sebagai satu set yang terdaftar resmi.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3 font-semibold">
              Pastikan:
            </p>
            
            <div className="space-y-2 text-left">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800">
                  • GSA ID yang Anda masukkan adalah milik Anda sendiri
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800">
                  • Nama lengkap sesuai dengan yang terdaftar di GSA
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800">
                  • Nama kampus sesuai dengan data resmi GSA
                </p>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  • Hubungi admin jika yakin semua data sudah benar
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
            >
              Periksa Kembali
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}