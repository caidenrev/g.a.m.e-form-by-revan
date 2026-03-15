'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Plus, Calendar } from 'lucide-react'

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  imageUrl?: string;
  createdAt?: any;
  author: string;
  authorId: string;
}

export default function MyArticlesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [myPosts, setMyPosts] = useState<BlogPost[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      const q = query(
        collection(db, 'blogs'), 
        where('authorId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BlogPost[]
        setMyPosts(postsData)
      })
      
      return () => unsubscribe()
    }
  }, [user, loading, router])

  const handleDelete = async (postId: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus artikel "${title}"?`)) return
    
    setDeleting(postId)
    try {
      await deleteDoc(doc(db, 'blogs', postId))
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Gagal menghapus artikel')
    } finally {
      setDeleting(null)
    }
  }

  if (loading || !user) {
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

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.18) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative z-10 w-full max-w-4xl px-4 py-8 mt-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700">
              <ArrowLeft className="w-5 h-5" /> Kembali
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b]">
              Artikel Saya
            </h1>
          </div>
          <Link href="/admin" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tulis Artikel
          </Link>
        </div>

        <div className="space-y-6">
          {myPosts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 opacity-50">
                <img src="/images/asset1.png" alt="No articles" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">Belum Ada Artikel</h3>
              <p className="text-gray-500 mb-6">Mulai menulis artikel pertama Anda!</p>
              <Link href="/admin" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Tulis Artikel Pertama
              </Link>
            </div>
          ) : (
            myPosts.map((post) => (
              <div key={post.id} className="relative bg-white p-6 sm:p-8 rounded-[32px] shadow-lg border-4 border-white hover:shadow-xl transition-all">
                <img src="/images/asset9.png" alt="Decoration" className="absolute -top-4 -left-4 w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md z-20 pointer-events-none" />
                <img src="/images/asset10.png" alt="Decoration" className="absolute -bottom-4 -right-4 w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md z-20 pointer-events-none" />

                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-blue-100 text-[#0ea5e9] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {post.category}
                      </span>
                      {post.createdAt && (
                        <span className="text-gray-400 text-xs font-semibold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> 
                          {post.createdAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-extrabold text-gray-800 leading-tight">
                      {post.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 font-medium line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="flex sm:flex-col gap-3 sm:gap-4">
                    <Link 
                      href={`/edit-article/${post.id}`}
                      className="flex items-center gap-2 bg-green-50 text-green-600 hover:bg-green-100 font-bold px-4 py-2 rounded-full transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={deleting === post.id}
                      className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold px-4 py-2 rounded-full transition-colors text-sm disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" /> 
                      {deleting === post.id ? 'Menghapus...' : 'Hapus'}
                    </button>

                    <Link 
                      href={`/blog/${post.id}`}
                      className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold px-4 py-2 rounded-full transition-colors text-sm"
                    >
                      Lihat
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}