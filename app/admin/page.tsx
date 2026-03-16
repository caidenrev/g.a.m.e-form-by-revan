/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import ImageCropper from '@/components/ImageCropper'

export default function AdminPage() {
  const { user, memberData, loading } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'article' | 'gallery'>('article')

  // Article states
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')

  // Gallery states
  const [galleryTitle, setGalleryTitle] = useState('')
  const [galleryCategory, setGalleryCategory] = useState('')
  const [galleryImage, setGalleryImage] = useState<File | null>(null)
  
  // Cropper states
  const [showCropper, setShowCropper] = useState(false)
  const [tempImage, setTempImage] = useState<string>('')

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
      await addDoc(collection(db, 'blogs'), {
        title,
        excerpt,
        content,
        category,
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
    } catch (error: unknown) {
      console.error('Error adding document: ', error)
      setMessage(`Gagal menambahkan artikel: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!galleryTitle || !galleryCategory || !galleryImage) {
      setMessage('Harap isi semua kolom termasuk gambar')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', galleryImage)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Gagal mengunggah gambar')
      }

      const uploadResult = await uploadResponse.json()
      const imageUrl = uploadResult.secure_url

      await addDoc(collection(db, 'gallery'), {
        title: galleryTitle,
        category: galleryCategory,
        imageUrl,
        author: memberData?.name || user.displayName || user.email,
        authorId: user.uid,
        createdAt: serverTimestamp(),
      })

      setMessage('Momen gallery berhasil ditambahkan!')
      setGalleryTitle('')
      setGalleryCategory('')
      setGalleryImage(null)
    } catch (error: unknown) {
      console.error('Error adding gallery: ', error)
      setMessage(`Gagal menambahkan momen: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setTempImage(reader.result as string)
        setShowCropper(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], 'upload.jpg', { type: 'image/jpeg' })
    setGalleryImage(croppedFile)
    setShowCropper(false)
  }


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.18) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-5 px-4 w-full">
        <div className="w-full max-w-3xl flex justify-between items-center bg-white/90 backdrop-blur-md px-6 py-3.5 rounded-full shadow-lg border border-white/20">
          <div className="flex items-center gap-3">
            <img src="/images/asset1.png" alt="GSA" className="h-8 w-auto object-contain" />
          </div>
          <div className="flex gap-4">
            <Link href="/">
              <Button variant="outline" className="rounded-full shadow-sm hover:bg-blue-50">Kembali <ArrowLeft className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="pt-24 w-full flex flex-col items-center">
        <Card className="relative z-10 w-full max-w-3xl bg-white shadow-xl rounded-[40px] border-2 border-blue-200 p-6 sm:p-10 mb-20 overflow-hidden">
          <h2 className="text-2xl font-bold text-center text-[#475467] mb-6 leading-snug">
            Dashboard <span className="text-[#0ea5e9]">Admin</span>
          </h2>

          {/* Tab Switcher */}
          <div className="flex bg-blue-50/50 p-1.5 rounded-full mb-8 max-w-md mx-auto border border-blue-100">
            <button
              onClick={() => setActiveTab('article')}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'article' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-blue-600'}`}
            >
              Artikel
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'gallery' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-blue-600'}`}
            >
              Gallery
            </button>
          </div>

          {message && (
            <div className={`p-4 mb-6 rounded-2xl font-semibold text-center border ${message.includes('berhasil') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {message}
            </div>
          )}

          {activeTab === 'article' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-6 sm:p-8 bg-[#f8fafc] rounded-3xl space-y-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-blue-500" />
                  Tulis Artikel Baru
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-[#475467] mb-2">Judul Artikel</label>
                  <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Masukkan judul..." className="bg-white border-0 shadow-sm rounded-full h-12 px-5 focus-visible:ring-blue-400" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#475467] mb-2">Kategori</label>
                  <Input required value={category} onChange={e => setCategory(e.target.value)} placeholder="Contoh: Web Development" className="bg-white border-0 shadow-sm rounded-full h-12 px-5 focus-visible:ring-blue-400" />
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
          ) : (
            <form onSubmit={handleGallerySubmit} className="space-y-6">
              <div className="p-6 sm:p-8 bg-[#f8fafc] rounded-3xl space-y-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-500" />
                  Tambah Momen Gallery
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-[#475467] mb-2">Caption / Judul Momen</label>
                  <Input required value={galleryTitle} onChange={e => setGalleryTitle(e.target.value)} placeholder="Contoh: Graduation Night 2025" className="bg-white border-0 shadow-sm rounded-full h-12 px-5 focus-visible:ring-blue-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#475467] mb-2">Kategori Momen</label>
                    <Input required value={galleryCategory} onChange={e => setGalleryCategory(e.target.value)} placeholder="Contoh: Event, Meetup, Trip" className="bg-white border-0 shadow-sm rounded-full h-12 px-5 focus-visible:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#475467] mb-2">Foto Momen</label>
                    <div className="bg-white rounded-full p-1 shadow-sm h-12 flex items-center">
                      <Input required type="file" accept="image/*" onChange={handleImageSelect} className="border-0 bg-transparent text-sm file:bg-blue-100 file:text-blue-700 file:border-0 file:rounded-full file:px-4 file:py-1 file:mr-4 file:font-semibold hover:file:bg-blue-200 cursor-pointer w-full focus-visible:ring-0 focus-visible:ring-offset-0 h-auto py-0 px-0" />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all mt-4">
                  {isSubmitting ? 'Mengunggah...' : 'Simpan ke Gallery'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>

      {showCropper && (
        <ImageCropper
          image={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
          aspect={1}
        />
      )}
    </div>
  )
}
