'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function AdminPage() {
  const { user, memberData, loading } = useAuth()
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
            {/* Using site-icon for loading animation */}
            <div className="w-20 h-20 mb-4 animate-spin-slow">
              <img src="/images/site-icon.png" alt="Loading..." className="w-full h-full object-contain drop-shadow-lg" />
            </div>
            <p className="text-blue-600 font-bold tracking-widest text-sm">MEMUAT...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !excerpt || !category || !content) {
      setMessage('Harap isi semua kolom')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      let imageUrl = ''
      if (image) {
        const formData = new FormData()
        formData.append('file', image)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || 'Gagal mengunggah gambar')
        }

        const uploadResult = await uploadResponse.json()
        imageUrl = uploadResult.secure_url
      }

      await addDoc(collection(db, 'blogs'), {
        title,
        excerpt,
        content,
        category,
        imageUrl,
        author: memberData?.name || user.displayName || user.email,
        authorId: user.uid,
        authorPhoto: user.photoURL,
        authorTier: memberData?.tier,
        authorCampus: memberData?.campus,
        createdAt: serverTimestamp(),
      })

      setMessage('Artikel berhasil ditambahkan!')
      setTitle('')
      setExcerpt('')
      setCategory('')
      setContent('')
      setImage(null)
    } catch (error: unknown) {
      console.error('Error adding document: ', error)
      setMessage(`Gagal menambahkan artikel: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.18) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative z-10 w-full max-w-3xl mb-8 flex justify-between items-center bg-white/80 backdrop-blur p-4 rounded-3xl shadow-sm border border-blue-50">
        <h1 className="text-2xl font-extrabold text-gray-800">Admin Dashboard</h1>
        <div className="flex gap-4">
           <Link href="/">
             <Button variant="outline" className="rounded-full shadow-sm hover:bg-blue-50">Kembali ke Beranda</Button>
           </Link>
        </div>
      </div>
      
      <Card className="relative z-10 w-full max-w-3xl bg-white shadow-xl rounded-[40px] border-2 border-blue-200 p-6 sm:p-10 mb-20 overflow-hidden">
        <h2 className="text-2xl font-bold text-center text-[#475467] mb-8 leading-snug">
          Tambah <span className="text-[#0ea5e9]">Artikel Baru</span>
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
            
            <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all mt-4">
              {isSubmitting ? 'Menyimpan...' : 'Terbitkan Artikel'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
