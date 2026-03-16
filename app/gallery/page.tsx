/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { ArrowLeft, Image as ImageIcon, Maximize2 } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  author: string;
  createdAt: any;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const galleryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryItem[]
      setItems(galleryData)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.18) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      {/* Floating Pill Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-5 px-4 w-full">
        <div className="w-full max-w-2xl flex items-center justify-between bg-white/90 backdrop-blur-md px-6 py-3.5 rounded-full shadow-lg border border-white/20">
          <div className="flex items-center gap-4">
            <img src="/images/asset1.png" alt="GSA" className="h-8 w-auto object-contain" />
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700">
            Kembali <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <main className="relative z-10 w-full pt-28 pb-20 flex flex-col items-center">
        <div className="max-w-6xl w-full px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl font-black text-gray-800 mb-4 tracking-tight">
              GSA <span className="text-blue-600">Moments</span>
            </h2>
            <p className="text-gray-500 font-medium max-w-lg mx-auto">
              Kumpulan dokumentasi keseruan dan pencapaian selama menjadi Google Student Ambassador.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-[32px]"></div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center py-20 bg-white/50 backdrop-blur-sm rounded-[40px] border-2 border-dashed border-gray-200">
              <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-400 font-bold">Belum ada momen yang diunggah.</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="relative group bg-white p-3 rounded-[32px] shadow-xl border-4 border-white break-inside-avoid hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => setSelectedImage(item.imageUrl)}
                >
                  <div className="relative aspect-auto rounded-[24px] overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="text-white w-8 h-8" />
                    </div>
                  </div>
                  <div className="mt-4 px-2 pb-2">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">{item.category}</span>
                    <h3 className="font-bold text-gray-800 mt-2 line-clamp-2">{item.title}</h3>
                    <p className="text-[10px] text-gray-400 font-medium mt-1">Uploaded by {item.author}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
          />
          <button
            className="absolute top-8 right-8 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <ArrowLeft className="w-8 h-8 rotate-180" />
          </button>
        </div>
      )}

      <Footer />
    </div>
  )
}
