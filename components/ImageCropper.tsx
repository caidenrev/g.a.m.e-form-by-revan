'use client'

import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '@/lib/imageUtils'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, RotateCcw } from 'lucide-react'

interface ImageCropperProps {
  image: string
  aspect?: number
  onCropComplete: (croppedImage: Blob) => void
  onCancel: () => void
}

const ImageCropper: React.FC<ImageCropperProps> = ({ 
  image, 
  aspect = 1, 
  onCropComplete, 
  onCancel 
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onCropAreaComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCrop = async () => {
    setIsProcessing(true)
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation)
      if (croppedImage) {
        onCropComplete(croppedImage)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onCancel}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">Sesuaikan Gambar</h3>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Cropper Container */}
          <div className="relative flex-1 min-h-[400px] bg-gray-50">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropAreaComplete}
              onRotationChange={setRotation}
            />
          </div>

          {/* Controls */}
          <div className="p-8 space-y-6 bg-white">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <ZoomIn className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <input 
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <RotateCcw className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <input 
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="flex-1 rounded-full h-12 font-bold"
              >
                Batal
              </Button>
              <Button 
                onClick={handleCrop}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 font-bold shadow-lg shadow-blue-200"
              >
                {isProcessing ? 'Memproses...' : 'Terapkan'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ImageCropper
