/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { ArrowLeft, Image as ImageIcon, Maximize2, Menu, LogIn } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  author: string;
  createdAt: Timestamp;
}

// Pagination for performance
const ITEMS_PER_PAGE = 12;

export default function GalleryPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

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

  // Pagination calculation
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE)
  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

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
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/images/asset1.png" alt="GSA" className="h-8 w-auto object-contain" />
          </Link>
          
          <div className="flex items-center gap-2">
            {user && (
              <div title={user.displayName || user.email || ''} className="w-8 h-8 rounded-full overflow-hidden border-2 border-green-500 shadow-sm">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="User Avatar" className="w-full h-full object-cover" />
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-full hover:bg-blue-50 transition-colors flex items-center justify-center cursor-pointer ml-1"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-gray-600 hover:text-blue-500 transition-colors" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        <div className={`absolute top-[76px] w-full max-w-lg px-4 transition-all duration-300 origin-top z-40 ${isMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'}`}>
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl mt-2 border border-blue-50 p-2 flex flex-col w-full">
            <Link href="/#members" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Members
            </Link>
            <Link href="/#recap" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Recap
            </Link>
            <Link href="/gallery" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Gallery
            </Link>
            <Link href="/events" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Events
            </Link>
            <Link href="/about" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              About
            </Link>

            {/* Divider */}
            {user && <div className="h-px bg-gray-200 my-2 mx-3"></div>}

            {/* User Menu */}
            {!user ? (
              <Link href="/auth" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Login
              </Link>
            ) : (
              <>
                <Link href="/my-profile" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
                <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-600 hover:bg-blue-50 rounded-2xl transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Admin Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <main className="relative z-10 w-full pt-28 pb-20 flex flex-col items-center">
        <div className="max-w-6xl w-full px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1e293b] leading-tight drop-shadow-sm mb-4">
              GSA <span className="text-[#0ea5e9]">Moments</span>
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
            <>
              <div className="space-y-8">
                {/* Row 1 */}
                <div className="gallery-grid">
                  {paginatedItems.slice(0, Math.ceil(paginatedItems.length / 2)).map((item) => (
                    <div
                      key={item.id}
                      className="relative group bg-white p-3 sm:p-4 rounded-[24px] sm:rounded-[32px] shadow-xl border-4 border-white hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
                      onClick={() => setSelectedImage(item.imageUrl)}
                    >
                      <div className="relative aspect-square rounded-[16px] sm:rounded-[24px] overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="text-white w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-4 px-1 sm:px-2 pb-2">
                        <span className="text-[8px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 sm:px-3 py-1 rounded-full">{item.category}</span>
                        <h3 className="font-bold text-gray-800 mt-2 line-clamp-2 text-xs sm:text-sm">{item.title}</h3>
                        <p className="text-[8px] sm:text-[10px] text-gray-400 font-medium mt-1">Uploaded by {item.author}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Row 2 */}
                {paginatedItems.length > Math.ceil(paginatedItems.length / 2) && (
                  <div className="gallery-grid">
                    {paginatedItems.slice(Math.ceil(paginatedItems.length / 2)).map((item) => (
                      <div
                        key={item.id}
                        className="relative group bg-white p-3 sm:p-4 rounded-[24px] sm:rounded-[32px] shadow-xl border-4 border-white hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
                        onClick={() => setSelectedImage(item.imageUrl)}
                      >
                        <div className="relative aspect-square rounded-[16px] sm:rounded-[24px] overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="text-white w-6 h-6 sm:w-8 sm:h-8" />
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-4 px-1 sm:px-2 pb-2">
                          <span className="text-[8px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 sm:px-3 py-1 rounded-full">{item.category}</span>
                          <h3 className="font-bold text-gray-800 mt-2 line-clamp-2 text-xs sm:text-sm">{item.title}</h3>
                          <p className="text-[8px] sm:text-[10px] text-gray-400 font-medium mt-1">Uploaded by {item.author}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 sm:gap-2 mt-8 sm:mt-12 px-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white border-2 border-blue-200 text-blue-600 font-bold rounded-full hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>
                  
                  <div className="flex gap-0.5 sm:gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-bold transition-all ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white border-2 border-blue-200 text-blue-600 font-bold rounded-full hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                  </button>
                </div>
              )}
            </>
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
