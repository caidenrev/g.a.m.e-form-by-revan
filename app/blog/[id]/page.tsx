/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc, Timestamp, collection, query, getDocs } from 'firebase/firestore'
import Link from 'next/link'
import { Calendar, Check, Menu, LogIn } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  createdAt?: Timestamp;
  author: string;
  authorId: string;
  authorPhoto?: string;
  authorTier?: 'Rising Star' | 'Achiever' | 'Stabilizer';
  authorCampus?: string;
  authorGsaId?: string;
}

interface MemberData {
  id: string;
  name: string;
  gsaId?: string;
  photoURL?: string;
  campus?: string;
}

export default function BlogPostPage() {
  const { user } = useAuth()
  const params = useParams()
  const postId = params.id as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [members, setMembers] = useState<MemberData[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)

  const loadPost = useCallback(async () => {
    try {
      const docRef = doc(db, 'blogs', postId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() } as BlogPost)
      }
    } catch (error) {
      console.error('Error loading post:', error)
    } finally {
      setLoading(false)
    }
  }, [postId])

  // Load members data for GSA ID lookup
  const loadMembers = useCallback(async () => {
    try {
      const membersQuery = query(collection(db, 'members'))
      const membersSnapshot = await getDocs(membersQuery)
      const membersData = membersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MemberData[]
      setMembers(membersData)
    } catch (error) {
      console.error('Error loading members:', error)
    }
  }, [])

  // Function to get GSA ID by author name
  const getAuthorGsaId = (authorName: string): string | null => {
    const member = members.find(m => m.name.toLowerCase() === authorName.toLowerCase())
    return member?.gsaId || null
  }

  useEffect(() => {
    if (postId) {
      loadPost()
      loadMembers()
    }
  }, [postId, loadPost, loadMembers])

  // Close share dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isShareOpen) {
        const target = event.target as Element
        if (!target.closest('.share-dropdown')) {
          setIsShareOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isShareOpen])

  const getTierColor = (tier?: string) => {
    switch(tier) {
      case 'Rising Star': return 'bg-blue-100 text-blue-600'
      case 'Achiever': return 'bg-pink-100 text-pink-600'
      case 'Trailblazer': return 'bg-purple-100 text-purple-600'
      case 'Stabilizer': return 'bg-purple-100 text-purple-600'
      default: 
        // Jika ada tier tapi bukan tier resmi, pakai hijau tua (custom tier)
        return tier ? 'bg-green-800 text-white' : 'bg-gray-100 text-gray-600'
    }
  }
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToWA = () => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`Baca artikel menarik ini: ${post?.title}`)
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank')
  }

  const shareToInstagram = () => {
    // Instagram doesn't have direct URL sharing, so we copy to clipboard
    const url = window.location.href
    const text = `Baca artikel menarik ini: ${post?.title}\n${url}`
    
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: text,
        url: url
      })
    } else {
      navigator.clipboard.writeText(text)
      alert('Link artikel telah disalin! Paste di Instagram Story atau Post kamu.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 mb-4 animate-spin-slow">
            <img src="/images/site-icon.png" alt="Loading..." className="w-full h-full object-contain drop-shadow-lg" />
          </div>
          <p className="text-blue-600 font-bold tracking-widest text-sm">MEMUAT...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Artikel Tidak Ditemukan</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.18) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

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

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28 pb-8">
        <article className="bg-white rounded-[40px] shadow-xl border-4 border-white p-8 sm:p-12">
          {/* Author Info - Moved to Top */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 mb-8 border-b-4 border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-blue-100 shadow-sm flex-shrink-0 bg-blue-100">
                <img 
                  src={post.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=3b82f6&color=fff`} 
                  alt={post.author} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-2xl sm:text-3xl">{post.author}</h3>
                {post.authorCampus && (
                  <p className="text-gray-600 text-lg sm:text-xl">{post.authorCampus}</p>
                )}
              </div>
            </div>

            {/* GSA ID and Share Buttons */}
            <div className="flex items-center gap-2">
              {/* GSA ID Badge - Dynamic based on author */}
              {getAuthorGsaId(post.author) && (
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl border-2 border-blue-200 shadow-sm flex items-center gap-2 font-bold text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>{getAuthorGsaId(post.author)}</span>
                </div>
              )}

              {/* Share Dropdown */}
              <div className="relative share-dropdown">
                <button 
                  onClick={() => setIsShareOpen(!isShareOpen)}
                  className="p-3 bg-white text-gray-600 hover:text-blue-600 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-bold text-sm"
                  title="Share Article"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>

                {/* Dropdown Menu */}
                {isShareOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border-2 border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                    <button 
                      onClick={() => {
                        handleCopyLink()
                        setIsShareOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                      <span className="font-semibold text-gray-700">
                        {copied ? 'Link Tersalin!' : 'Salin Link'}
                      </span>
                    </button>

                    <button 
                      onClick={() => {
                        shareToWA()
                        setIsShareOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z"/>
                      </svg>
                      <span className="font-semibold text-gray-700">WhatsApp</span>
                    </button>

                    <button 
                      onClick={() => {
                        shareToInstagram()
                        setIsShareOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span className="font-semibold text-gray-700">Instagram</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-blue-100 text-[#0ea5e9] text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                {post.category}
              </span>
              {post.authorTier && (
                <span className={`text-sm font-bold px-4 py-2 rounded-full ${getTierColor(post.authorTier)}`}>
                  {post.authorTier}
                </span>
              )}
              {post.createdAt && (
                <span className="text-gray-400 text-sm font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> 
                  {post.createdAt?.toDate().toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 leading-tight mb-6">
              {post.title}
            </h1>

            <p className="text-lg text-gray-600 font-medium leading-relaxed mb-8">
              {post.excerpt}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}