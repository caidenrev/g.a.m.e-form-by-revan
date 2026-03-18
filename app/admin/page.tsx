/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, ArrowLeft, Calendar } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import ImageCropper from '@/components/ImageCropper'
import CompressionPopup from '@/components/CompressionPopup'
import { validateFileSize, compressImage } from '@/lib/cloudinary'
import { Trash2, ExternalLink } from 'lucide-react'

interface EventWithId {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  createdAt: Timestamp;
}

export default function AdminPage() {
  const { user, memberData, loading } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'article' | 'gallery' | 'event'>('article')

  // Article states
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')

  // Gallery states
  const [galleryTitle, setGalleryTitle] = useState('')
  const [galleryCategory, setGalleryCategory] = useState('')
  const [galleryImage, setGalleryImage] = useState<File | null>(null)

  // Event states
  const [eventTitle, setEventTitle] = useState('')
  const [eventSubtitle, setEventSubtitle] = useState('')
  const [eventLink, setEventLink] = useState('')
  const [eventPoster, setEventPoster] = useState<File | null>(null)
  const [events, setEvents] = useState<EventWithId[]>([])
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  
  // Cropper states
  const [showCropper, setShowCropper] = useState(false)
  const [tempImage, setTempImage] = useState<string>('')
  const [cropTarget, setCropTarget] = useState<'gallery' | 'event'>('gallery')
  
  // Compression popup states
  const [showCompressionPopup, setShowCompressionPopup] = useState(false)
  const [rejectedFile, setRejectedFile] = useState<{ name: string; size: string } | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EventWithId[]
      setEvents(eventsData)
    })
    return () => unsubscribe()
  }, [user])

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
        authorPhoto: user.photoURL || null,
        authorTier: memberData?.tier || null,
        authorCampus: memberData?.campus || null,
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

  const handleEditEvent = (event: EventWithId) => {
    setEditingEventId(event.id)
    setEventTitle(event.title)
    setEventSubtitle(event.subtitle)
    setEventLink(event.link)
    setExistingImageUrl(event.imageUrl)
    setMessage(`Mengedit event: ${event.title}`)
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Apakah Abang yakin ingin menghapus event ini?')) return
    
    try {
      await deleteDoc(doc(db, 'events', eventId))
      setMessage('Event berhasil dihapus!')
    } catch (error) {
      console.error('Error deleting event:', error)
      setMessage('Gagal menghapus event.')
    }
  }

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventTitle || !eventSubtitle || !eventLink || (!eventPoster && !editingEventId)) {
      setMessage('Harap isi semua kolom termasuk poster dan link')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      let imageUrl = existingImageUrl

      if (eventPoster) {
        const formData = new FormData()
        formData.append('file', eventPoster)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          throw new Error('Gagal mengunggah poster')
        }

        const uploadResult = await uploadResponse.json()
        imageUrl = uploadResult.secure_url
      }

      const eventData = {
        title: eventTitle,
        subtitle: eventSubtitle,
        link: eventLink,
        imageUrl,
        author: memberData?.name || user.displayName || user.email,
        authorId: user.uid,
        updatedAt: serverTimestamp(),
      }

      if (editingEventId) {
        await updateDoc(doc(db, 'events', editingEventId), eventData)
        setMessage('Event berhasil diperbarui!')
      } else {
        await addDoc(collection(db, 'events'), {
          ...eventData,
          createdAt: serverTimestamp(),
        })
        setMessage('Event berhasil ditambahkan!')
      }

      setEventTitle('')
      setEventSubtitle('')
      setEventLink('')
      setEventPoster(null)
      setEditingEventId(null)
      setExistingImageUrl(null)
    } catch (error: unknown) {
      console.error('Error saving event: ', error)
      setMessage(`Gagal menyimpan event: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>, target: 'gallery' | 'event') => {
    const file = e.target.files?.[0]
    if (file) {
      // Validasi ukuran file (1MB)
      if (!validateFileSize(file, 1)) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
        setRejectedFile({
          name: file.name,
          size: `${fileSizeMB} MB`
        })
        setShowCompressionPopup(true)
        // Reset input
        e.target.value = ''
        return
      }

      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP.')
        e.target.value = ''
        return
      }

      setCropTarget(target)
      
      // Kompres gambar jika terlalu besar (>500KB)
      let processedFile = file
      if (file.size > 512 * 1024) { // Jika lebih dari 500KB
        try {
          const compressedBlob = await compressImage(file, 1200, 0.8)
          processedFile = new File([compressedBlob!], file.name, { type: 'image/jpeg' })
        } catch (error) {
          console.error('Compression error:', error)
        }
      }

      const reader = new FileReader()
      reader.onload = () => {
        setTempImage(reader.result as string)
        setShowCropper(true)
      }
      reader.readAsDataURL(processedFile)
    }
  }

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], 'upload.jpg', { type: 'image/jpeg' })
    if (cropTarget === 'gallery') {
      setGalleryImage(croppedFile)
    } else {
      setEventPoster(croppedFile)
    }
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
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1e293b] leading-tight drop-shadow-sm mb-6 text-center">
            Dashboard <span className="text-[#0ea5e9]">Admin</span>
          </h2>

          {/* Tab Switcher */}
          <div className="flex bg-blue-50/50 p-1.5 rounded-full mb-8 max-w-lg mx-auto border border-blue-100">
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
            {(memberData?.name?.toUpperCase() === 'EKA REVANDI' || user?.email === 'ekarevandii@gmail.com') && (
              <button
                onClick={() => setActiveTab('event')}
                className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'event' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-blue-600'}`}
              >
                Event
              </button>
            )}
          </div>

          {message && (
            <div className={`p-4 mb-6 rounded-2xl font-semibold text-center border ${message.includes('berhasil') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {message}
            </div>
          )}

          {activeTab === 'article' && (
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
          )}

          {activeTab === 'gallery' && (
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
                      <Input required type="file" accept="image/*" onChange={(e) => handleImageSelect(e, 'gallery')} className="border-0 bg-transparent text-sm file:bg-blue-100 file:text-blue-700 file:border-0 file:rounded-full file:px-4 file:py-1 file:mr-4 file:font-semibold hover:file:bg-blue-200 cursor-pointer w-full focus-visible:ring-0 focus-visible:ring-offset-0 h-auto py-0 px-0" />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all mt-4">
                  {isSubmitting ? 'Mengunggah...' : 'Simpan ke Gallery'}
                </Button>
              </div>
            </form>
          )}
          {activeTab === 'event' && (memberData?.name?.toUpperCase() === 'EKA REVANDI' || user?.email === 'ekarevandii@gmail.com') && (
            <form onSubmit={handleEventSubmit} className="space-y-6">
              <div className="p-6 sm:p-8 bg-[#f8fafc] rounded-3xl space-y-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    {editingEventId ? 'Edit Event' : 'Upload Event Baru'}
                  </h3>
                  {editingEventId && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditingEventId(null)
                        setEventTitle('')
                        setEventSubtitle('')
                        setEventLink('')
                        setEventPoster(null)
                        setExistingImageUrl(null)
                        setMessage('')
                      }}
                      className="text-red-500 hover:text-red-600 font-bold hover:bg-red-50 rounded-full"
                    >
                      Batal Edit
                    </Button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#475467] mb-2">Judul Event</label>
                  <Input required value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="Contoh: Webinar Cloud Computing" className="bg-white border-0 shadow-sm rounded-full h-12 px-5 focus-visible:ring-blue-400" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#475467] mb-2">Link Registrasi / Event (URL)</label>
                  <Input required type="url" value={eventLink} onChange={e => setEventLink(e.target.value)} placeholder="https://..." className="bg-white border-0 shadow-sm rounded-full h-12 px-5 focus-visible:ring-blue-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#475467] mb-2">Subtitle Event</label>
                    <Input required value={eventSubtitle} onChange={e => setEventSubtitle(e.target.value)} placeholder="Contoh: Learn from the experts" className="bg-white border-0 shadow-sm rounded-full h-12 px-5 focus-visible:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#475467] mb-2">Poster Event (3:4)</label>
                    <div className="bg-white rounded-full p-1 shadow-sm h-12 flex items-center mb-1">
                      <Input required={!editingEventId} type="file" accept="image/*" onChange={(e) => handleImageSelect(e, 'event')} className="border-0 bg-transparent text-sm file:bg-blue-100 file:text-blue-700 file:border-0 file:rounded-full file:px-4 file:py-1 file:mr-4 file:font-semibold hover:file:bg-blue-200 cursor-pointer w-full focus-visible:ring-0 focus-visible:ring-offset-0 h-auto py-0 px-0" />
                    </div>
                    {editingEventId && !eventPoster && existingImageUrl && (
                      <p className="text-[10px] text-gray-400 px-4 italic">Menggunakan poster lama. Pilih file baru untuk mengganti.</p>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all mt-4">
                  {isSubmitting ? 'Menyimpan...' : editingEventId ? 'Simpan Perubahan' : 'Terbitkan Event'}
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'event' && events.length > 0 && (
            <div className="mt-12 space-y-6 px-4 pb-10">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1.5 bg-blue-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-[#1e293b]">Daftar Event</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {events.map((event) => (
                  <Card key={event.id} className="p-4 bg-white border-blue-50 hover:border-blue-200 transition-colors shadow-sm rounded-3xl overflow-hidden border">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-50">
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-gray-800 truncate uppercase">{event.title}</h4>
                        <p className="text-sm text-gray-500 truncate mb-3">{event.subtitle}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button 
                            onClick={() => handleEditEvent(event)}
                            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteEvent(event.id)}
                            className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 px-3 py-1.5 rounded-full transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> Hapus
                          </button>
                          {event.link && (
                            <a 
                              href={event.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" /> Preview Link
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {showCropper && (
        <ImageCropper
          image={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
          aspect={cropTarget === 'event' ? 3/4 : 1}
        />
      )}

      {showCompressionPopup && rejectedFile && (
        <CompressionPopup
          isOpen={showCompressionPopup}
          onClose={() => {
            setShowCompressionPopup(false)
            setRejectedFile(null)
          }}
          fileName={rejectedFile.name}
          fileSize={rejectedFile.size}
        />
      )}
    </div>
  )
}
