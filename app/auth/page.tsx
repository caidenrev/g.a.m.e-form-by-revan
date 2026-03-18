/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import ImageCropper from '@/components/ImageCropper'
import CompressionPopup from '@/components/CompressionPopup'
import LoginPopup from '@/components/LoginPopup'
import GsaRejectionPopup from '@/components/GsaRejectionPopup'
import { GSAID_LIST } from '@/lib/gsa-ids'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { validateFileSize } from '@/lib/cloudinary'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [campus, setCampus] = useState('')
  const [gsaId, setGsaId] = useState('')
  const [tier, setTier] = useState<'Rising Star' | 'Achiever' | 'Trailblazer' | ''>('')
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [tempImage, setTempImage] = useState<string>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [showRejectionPopup, setShowRejectionPopup] = useState(false)
  const [hasShownPopup, setHasShownPopup] = useState(false)
  const [message, setMessage] = useState('')
  
  // Compression popup states
  const [showCompressionPopup, setShowCompressionPopup] = useState(false)
  const [rejectedFile, setRejectedFile] = useState<{ name: string; size: string } | null>(null)
  
  const { signIn, signUp, resetPassword } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // Check if popup has been shown in this session
        const popupShown = sessionStorage.getItem('login_popup_shown')
        if (!popupShown && !hasShownPopup) {
          setShowLoginPopup(true)
          setHasShownPopup(true)
          sessionStorage.setItem('login_popup_shown', 'true')
          setLoading(false)
          return
        }
        await signIn(email, password)
      } else {
        if (!name || !campus) {
          setError('Nama dan Asal Kampus wajib diisi')
          setLoading(false)
          return
        }

        // Validate GSA ID existence in authorized list
        if (!gsaId || !GSAID_LIST.includes(gsaId.trim())) {
          setShowRejectionPopup(true)
          setLoading(false)
          return
        }

        // Check if GSA ID is already used
        const q = query(collection(db, 'members'), where('gsaId', '==', gsaId.trim()))
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          setError('GSA ID ini sudah terdaftar. Gunakan GSA ID lain atau hubungi admin jika ini adalah ID kamu.')
          setLoading(false)
          return
        }

        let photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`

        // Upload profile photo if provided
        if (profilePhoto) {
          const formData = new FormData()
          formData.append('file', profilePhoto)
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            photoURL = uploadResult.secure_url
          }
        }

        await signUp(email, password, {
          name,
          campus,
          gsaId: gsaId || null,
          tier: tier || null,
          photoURL,
        })
      }
      router.push('/')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Terjadi kesalahan')
      } else {
        setError('Terjadi kesalahan')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError('Masukkan email Anda terlebih dahulu untuk mereset password.')
      return
    }
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await resetPassword(email)
      setMessage('Email pemulihan password telah dikirim! Silakan periksa kotak masuk (inbox) atau folder spam Anda.')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Gagal mengirim email reset password')
      } else {
        setError('Gagal mengirim email reset password')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      const reader = new FileReader()
      reader.onload = () => {
        setTempImage(reader.result as string)
        setShowCropper(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' })
    setProfilePhoto(croppedFile)
    setShowCropper(false)
  }

  const getTierColor = (tierName: string) => {
    switch(tierName) {
      case 'Rising Star': return 'bg-blue-100 text-blue-600 border-blue-200'
      case 'Achiever': return 'bg-pink-100 text-pink-600 border-pink-200'
      case 'Trailblazer': return 'bg-purple-100 text-purple-600 border-purple-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.18) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <img src="/images/asset1.png" alt="GSA" className="h-16 object-contain" />
        </Link>

        <Card className="bg-white shadow-xl rounded-[40px] border-2 border-blue-200 p-8 overflow-hidden">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1e293b] leading-tight drop-shadow-sm mb-6 text-center">
            {isLogin ? 'Login' : 'Daftar'} <span className="text-[#0ea5e9]">Member GSA</span>
          </h2>

          {error && (
            <div className="p-4 mb-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-sm font-semibold text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="p-4 mb-4 rounded-2xl bg-green-50 text-green-700 border border-green-200 text-sm font-semibold text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-[#475467] mb-2">Foto Profile (Opsional)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-blue-50 bg-blue-50 flex-shrink-0">
                      {profilePhoto ? (
                        <img src={URL.createObjectURL(profilePhoto)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-300">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-blue-50 rounded-2xl p-1 shadow-sm h-12 flex items-center">
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageSelect} 
                          className="border-0 bg-transparent text-sm file:bg-blue-100 file:text-blue-700 file:border-0 file:rounded-full file:px-4 file:py-1 file:mr-4 file:font-semibold hover:file:bg-blue-200 cursor-pointer w-full focus-visible:ring-0 focus-visible:ring-offset-0 h-auto py-0 px-0" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#475467] mb-2">Nama Lengkap *</label>
                  <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Masukkan nama lengkap" className="bg-white border-0 shadow-sm rounded-full h-12 px-5 focus-visible:ring-blue-400" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#475467] mb-2">Asal Kampus *</label>
                  <Input required value={campus} onChange={e => setCampus(e.target.value)} placeholder="Contoh: Universitas Indonesia" className="bg-white border-0 shadow-sm rounded-full h-12 px-5 focus-visible:ring-blue-400" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#475467] mb-2">GSA ID *</label>
                  <Input required value={gsaId} onChange={e => setGsaId(e.target.value)} placeholder="Contoh: GSAID25612" className="bg-white border-0 shadow-sm rounded-full h-12 px-5 focus-visible:ring-blue-400" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#475467] mb-2">Tier (Opsional)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Rising Star', 'Achiever', 'Trailblazer'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTier(tier === t ? '' : t)}
                        className={`px-3 py-2 rounded-full text-xs font-bold border-2 transition-all ${tier === t ? getTierColor(t) : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#475467] mb-2">Email *</label>
              <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className="bg-white border-0 shadow-sm rounded-full h-12 px-5 focus-visible:ring-blue-400" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#475467] mb-2">Password *</label>
              <Input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 6 karakter" className="bg-white border-0 shadow-sm rounded-full h-12 px-5 focus-visible:ring-blue-400" />
              {isLogin && (
                <div className="flex justify-end mt-2">
                  <button 
                    type="button" 
                    onClick={handleResetPassword} 
                    className="text-xs text-blue-600 font-bold hover:underline"
                    disabled={loading}
                  >
                    Lupa Password?
                  </button>
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all mt-6">
              {loading ? 'Memproses...' : (isLogin ? 'Login' : 'Daftar')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-blue-600 font-semibold hover:underline">
              {isLogin ? 'Belum punya akun? Daftar di sini' : 'Sudah punya akun? Login di sini'}
            </button>
          </div>
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

      <LoginPopup 
        isOpen={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)} 
      />

      <GsaRejectionPopup
        isOpen={showRejectionPopup}
        onClose={() => setShowRejectionPopup(false)}
      />

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
