/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EditArticlePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string
  
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadArticle = useCallback(async () => {
    try {
      const docRef = doc(db, 'blogs', articleId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        
        // Check if user is the author
        if (data.authorId !== user?.uid) {
          setMessage('Anda tidak memiliki akses untuk mengedit artikel ini')
          return
        }
        
        setTitle(data.title || '')
        setExcerpt(data.excerpt || '')
        setCategory(data.category || '')
        setContent(data.content || '')
        setCurrentImageUrl(data.imageUrl || '')
      } else {
        setMessage('Artikel tidak ditemukan')
      }
    } catch (error) {
      console.error('Error loading article:', error)
      setMessage('Gagal memuat artikel')
    } finally {
      setIsLoading(false)
    }
  }, [articleId, user?.uid])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }

    if (user && articleId) {
      loadArticle()
    }
  }, [user, loading, router, articleId, loadArticle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !excerpt || !category || !content) {
      setMessage('Harap isi semua kolom')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      let imageUrl = currentImageUrl
      
      // Upload new image if provided
      if (image) {
        const formData = new FormData()
        formData.append('file', image)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          imageUrl = uploadResult.secure_url
        }
      }

      await updateDoc(doc(db, 'blogs', articleId), {
        title,
        excerpt,
        content,
        category,
        imageUrl,
        updatedAt: serverTimestamp(),
      })

      setMessage('Artikel berhasil diperbarui!')
      setTimeout(() => {
        router.push('/my-articles')
      }, 1500)
    } catch (error: unknown) {
      console.error('Error updating article: ', error)
      setMessage(`Gagal memperbarui artikel: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || isLoading || !user) {
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.18) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative z-10 w-full max-w-3xl mb-8 flex justify-between items-center bg-white/80 backdrop-blur p-4 rounded-3xl shadow-sm border border-blue-50">
        <div className="flex items-center gap-4">
          <Link href="/my-articles" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700">
            <ArrowLeft className="w-5 h-5" /> Kembali
          </Link>
          <h1 className="text-xl font-extrabold text-gray-800">Edit Artikel</h1>
        </div>
      </div>
      
      <Card className="relative z-10 w-full max-w-3xl bg-white shadow-xl rounded-[40px] border-2 border-blue-200 p-6 sm:p-10 mb-20 overflow-hidden">
        <h2 className="text-2xl font-bold text-center text-[#475467] mb-8 leading-snug">
          Edit <span className="text-[#0ea5e9]">Artikel</span>
        </h2>
        
        {message && (
          <div className={`p-4 mb-6 rounded-2xl font-semibold text-center border ${message.includes('berhasil') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 sm:p-8 bg-[#eff6ff] rounded-3xl space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#475467] mb-2">Judul Artikel</label>
              <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Masukkan judul..." className="bg-white border-0 shadow-sm rounded-full h-12 px-5 focus-visible:ring-blue-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#475467] mb-2">Kategori</label>
                <Input required value={category} onChange={e => setCategory(e.target.value)} placeholder="Contoh: Web Development" className="bg-white border-0 shadow-sm rounded-full h-12 px-5 focus-visible:ring-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#475467] mb-2">Gambar Sampul (Opsional)</label>
                <div className="bg-white rounded-full p-1 shadow-sm h-12 flex items-center">
                  <Input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} className="border-0 bg-transparent text-sm file:bg-blue-100 file:text-blue-700 file:border-0 file:rounded-full file:px-4 file:py-1 file:mr-4 file:font-semibold hover:file:bg-blue-200 cursor-pointer w-full focus-visible:ring-0 focus-visible:ring-offset-0" />
                </div>
                {currentImageUrl && (
                  <p className="text-xs text-gray-500 mt-1">Gambar saat ini: Ada</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#475467] mb-2">Ringkasan (Excerpt)</label>
              <Textarea required value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Ringkasan singkat artikel..." className="bg-white border-0 shadow-sm min-h-[100px] rounded-3xl p-5 focus-visible:ring-blue-400" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#475467] mb-2">Konten Lengkap</label>
              <Textarea required value={content} onChange={e => setContent(e.target.value)} placeholder="Tuliskan konten artikel secara detail..." className="bg-white border-0 shadow-sm min-h-[250px] rounded-3xl p-5 focus-visible:ring-blue-400" />
            </div>
            
            <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all mt-4">
              {isSubmitting ? 'Menyimpan...' : 'Perbarui Artikel'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}