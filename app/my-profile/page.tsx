/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Camera, Save, Linkedin, Instagram, Menu, LogIn } from 'lucide-react'
import ImageCropper from '@/components/ImageCropper'
import TierValidationPopup from '@/components/TierValidationPopup'
import { extractPublicId, deleteCloudinaryImage } from '@/lib/cloudinary'
import { validateTierForGSAID, getAllowedTierForGSAID, isGSAOnlyMember } from '@/lib/tier-validation'

export default function MyProfilePage() {
  const { user, memberData, loading } = useAuth()
  const router = useRouter()

  const [name, setName] = useState('')
  const [campus, setCampus] = useState('')
  const [gsaId, setGsaId] = useState('')
  const [tier, setTier] = useState<'Rising Star' | 'Achiever' | 'Trailblazer' | string>('')
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [tempImage, setTempImage] = useState<string>('')
  const [currentPhotoURL, setCurrentPhotoURL] = useState('')
  const [linkedIn, setLinkedIn] = useState('')
  const [instagram, setInstagram] = useState('')

  const [showTierValidationPopup, setShowTierValidationPopup] = useState(false)
  const [tierValidationMessage, setTierValidationMessage] = useState('')
  const [allowedTier, setAllowedTier] = useState<string | undefined>(undefined)
  const [isGSAOnly, setIsGSAOnly] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }

    if (user && memberData) {
      setName(memberData.name || '')
      setCampus(memberData.campus || '')
      setGsaId(memberData.gsaId || '')
      setTier(memberData.tier || '')
      setCurrentPhotoURL(user.photoURL || '')
      setLinkedIn(memberData.linkedIn || '')
      setInstagram(memberData.instagram || '')
    }
  }, [user, memberData, loading, router])

  // Validasi tier saat data pertama kali dimuat
  useEffect(() => {
    if (gsaId && tier && !showTierValidationPopup) {
      const tierValidation = validateTierForGSAID(gsaId.trim(), tier)
      if (!tierValidation.isValid) {
        // Tampilkan peringatan jika tier tidak sesuai
        setMessage(`⚠️ Tier kamu saat ini (${tier}) tidak sesuai dengan data resmi. Silakan perbarui tier atau kosongkan.`)
      }
    }
  }, [gsaId, tier, showTierValidationPopup])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !campus) {
      setMessage('Nama dan Asal Kampus wajib diisi')
      return
    }

    // Validate tier selection against Final-Data.json if both gsaId and tier are provided
    if (gsaId && tier) {
      const tierValidation = validateTierForGSAID(gsaId.trim(), tier)
      if (!tierValidation.isValid) {
        setTierValidationMessage(tierValidation.message)
        setAllowedTier(tierValidation.allowedTier)
        setIsGSAOnly(tierValidation.isGSAOnly || false)
        setShowTierValidationPopup(true)
        return
      }
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      let photoURL = currentPhotoURL
      let oldPhotoPublicId: string | null = null

      // Extract old photo public_id for deletion
      if (currentPhotoURL && profilePhoto) {
        oldPhotoPublicId = extractPublicId(currentPhotoURL)
      }

      // Upload new profile photo if provided
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

          // Delete old photo from Cloudinary after successful upload
          if (oldPhotoPublicId) {
            console.log('Deleting old photo:', oldPhotoPublicId)
            const deleteSuccess = await deleteCloudinaryImage(oldPhotoPublicId, currentPhotoURL)
            if (deleteSuccess) {
              console.log('Old photo deleted successfully')
            } else {
              console.warn('Failed to delete old photo, but continuing...')
            }
          }
        } else {
          throw new Error('Gagal mengunggah foto profile')
        }
      }

      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: photoURL
        })
      }

      // Update Firestore member data
      if (user) {
        await setDoc(doc(db, 'members', user.uid), {
          name,
          campus,
          gsaId: gsaId || null,
          tier: tier || null,
          photoURL,
          linkedIn: linkedIn || null,
          instagram: instagram || null,
          updatedAt: new Date(),
        }, { merge: true })
      }

      setMessage('Profile berhasil diperbarui!')
      setCurrentPhotoURL(photoURL)
      setProfilePhoto(null)

      // Refresh the page after 1.5 seconds to show updated data
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: unknown) {
      console.error('Error updating profile:', error)
      setMessage(`Gagal memperbarui profile: ${error instanceof Error ? error.message : String(error)}`)
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
    const croppedFile = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' })
    setProfilePhoto(croppedFile)
    setShowCropper(false)
  }

  const handleSelectCorrectTier = (correctTier: string) => {
    setTier(correctTier)
  }

  const handleGsaIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGsaId = e.target.value
    setGsaId(newGsaId)
    
    // Reset tier jika GSA ID berubah dan tier tidak sesuai
    if (newGsaId && tier) {
      const tierValidation = validateTierForGSAID(newGsaId.trim(), tier)
      if (!tierValidation.isValid) {
        setTier('') // Reset tier selection
      }
    }
  }

  const handleTierSelection = (selectedTier: string) => {
    const newTier = tier === selectedTier ? '' : selectedTier
    setTier(newTier)
    
    // Validasi real-time jika GSA ID sudah diisi
    if (gsaId && newTier) {
      const tierValidation = validateTierForGSAID(gsaId.trim(), newTier)
      if (!tierValidation.isValid) {
        setTierValidationMessage(tierValidation.message)
        setAllowedTier(tierValidation.allowedTier)
        setIsGSAOnly(tierValidation.isGSAOnly || false)
        setShowTierValidationPopup(true)
        // Reset tier selection jika tidak valid
        setTier('')
      }
    }
  }

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'Rising Star': return 'bg-blue-100 text-blue-600 border-blue-200'
      case 'Achiever': return 'bg-pink-100 text-pink-600 border-pink-200'
      case 'Trailblazer': return 'bg-purple-100 text-purple-600 border-purple-200'
      default: 
        // Jika ada tier tapi bukan 3 tier resmi, pakai hijau tua (custom tier)
        return tierName ? 'bg-green-800 text-white border-green-800' : 'bg-gray-100 text-gray-600 border-gray-200'
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
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

      <div className="pt-24 w-full flex flex-col items-center">
        <Card className="relative z-10 w-full max-w-2xl bg-white shadow-xl rounded-[40px] border-2 border-blue-200 p-8 overflow-hidden">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1e293b] leading-tight drop-shadow-sm mb-8 text-center">
            Edit <span className="text-[#0ea5e9]">Profile</span>
          </h2>

          {message && (
            <div className={`p-4 mb-6 rounded-2xl font-semibold text-center border ${message.includes('berhasil') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-6 bg-[#eff6ff] rounded-3xl space-y-6">
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-blue-50 bg-blue-50 shadow-lg">
                    {profilePhoto ? (
                      <img src={URL.createObjectURL(profilePhoto)} alt="Preview" className="w-full h-full object-cover" />
                    ) : currentPhotoURL ? (
                      <img src={currentPhotoURL} alt="Current Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-300">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full cursor-pointer shadow-lg transition-colors">
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      id="profile-upload"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 text-center">Klik ikon kamera untuk mengubah foto profile</p>
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
                <label className="block text-sm font-semibold text-[#475467] mb-2">GSA ID (Opsional)</label>
                <Input value={gsaId} onChange={handleGsaIdChange} placeholder="Contoh: GSAID25612" className="bg-white border-0 shadow-sm rounded-full h-12 px-5 focus-visible:ring-blue-400" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#475467] mb-2">Tier (Opsional)</label>
                {gsaId && (() => {
                  const recommendedTier = getAllowedTierForGSAID(gsaId.trim())
                  const isGSAOnlyUser = isGSAOnlyMember(gsaId.trim())
                  
                  if (isGSAOnlyUser) {
                    return (
                      <div className="mb-3 p-3 bg-blue-50 rounded-2xl border border-blue-200">
                        <p className="text-xs text-blue-700 font-semibold mb-2">
                          Berdasarkan GSA ID kamu, kamu terdaftar sebagai:
                        </p>
                        <div className="flex justify-center">
                          <span className="px-3 py-1 rounded-full text-xs font-bold border-2 bg-blue-100 text-blue-600 border-blue-200">
                            Google Student Ambassador
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 mt-2 text-center">
                          Tidak memiliki tier khusus
                        </p>
                      </div>
                    )
                  }
                  
                  return recommendedTier ? (
                    <div className="mb-3 p-3 bg-blue-50 rounded-2xl border border-blue-200">
                      <p className="text-xs text-blue-700 font-semibold mb-2">
                        Berdasarkan GSA ID kamu, tier yang sesuai adalah:
                      </p>
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getTierColor(recommendedTier)}`}>
                          {recommendedTier}
                        </span>
                      </div>
                    </div>
                  ) : null
                })()}
                <div className="grid grid-cols-3 gap-2">
                  {(['Rising Star', 'Achiever', 'Trailblazer'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTierSelection(t)}
                      className={`px-3 py-2 rounded-full text-xs font-bold border-2 transition-all ${tier === t ? getTierColor(t) : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#475467] mb-2">LinkedIn URL (Opsional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Linkedin className="h-5 w-5 text-blue-500" />
                  </div>
                  <Input 
                    value={linkedIn} 
                    onChange={e => setLinkedIn(e.target.value)} 
                    placeholder="https://linkedin.com/in/username" 
                    className="bg-white border-0 shadow-sm rounded-full h-12 pl-12 pr-5 focus-visible:ring-blue-400" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#475467] mb-2">Instagram URL (Opsional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Instagram className="h-5 w-5 text-pink-500" />
                  </div>
                  <Input 
                    value={instagram} 
                    onChange={e => setInstagram(e.target.value)} 
                    placeholder="https://instagram.com/username" 
                    className="bg-white border-0 shadow-sm rounded-full h-12 pl-12 pr-5 focus-visible:ring-blue-400" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#475467] mb-2">Email</label>
                <Input disabled value={user.email || ''} className="bg-gray-100 border-0 shadow-sm rounded-full h-12 px-5 text-gray-500" />
                <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all mt-6 flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                {isSubmitting ? 'Menyimpan...' : 'Simpan Profile'}
              </Button>
            </div>
          </form>
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

      <TierValidationPopup
        isOpen={showTierValidationPopup}
        onClose={() => setShowTierValidationPopup(false)}
        message={tierValidationMessage}
        allowedTier={allowedTier}
        isGSAOnly={isGSAOnly}
        onSelectCorrectTier={handleSelectCorrectTier}
      />
    </div>
  )
}