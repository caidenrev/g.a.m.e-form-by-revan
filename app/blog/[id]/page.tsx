/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc, Timestamp } from 'firebase/firestore'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'

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
}

export default function BlogPostPage() {
  const params = useParams()
  const postId = params.id as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    if (postId) {
      loadPost()
    }
  }, [postId, loadPost])

  const getTierColor = (tier?: string) => {
    switch(tier) {
      case 'Rising Star': return 'bg-blue-100 text-blue-600'
      case 'Achiever': return 'bg-pink-100 text-pink-600'
      case 'Stabilizer': return 'bg-purple-100 text-purple-600'
      default: return 'bg-gray-100 text-gray-600'
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
          <div className="flex items-center gap-4">
            <img src="/images/asset1.png" alt="GSA" className="h-8 w-auto object-contain" />
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700">
            Kembali <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28 pb-8">

        <article className="bg-white rounded-[40px] shadow-xl border-4 border-white p-8 sm:p-12">
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

            {/* Author Info */}
            <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-3xl">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-blue-100 shadow-sm flex-shrink-0 bg-blue-100">
                <img 
                  src={post.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=3b82f6&color=fff`} 
                  alt={post.author} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{post.author}</h3>
                {post.authorCampus && (
                  <p className="text-gray-600 text-sm">{post.authorCampus}</p>
                )}
              </div>
            </div>
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