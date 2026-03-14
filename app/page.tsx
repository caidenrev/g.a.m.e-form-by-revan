'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Download, Star, Users, Calendar, Award, Menu, Home } from 'lucide-react'
import Link from 'next/link'

export default function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    feedback: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const instructors = [
    { name: 'Eka Revandi', role: 'Speaker G.A.M.E', image: '/images/revan.jpeg' },
    { name: 'Rifky Akbar Utomo', role: 'Speaker G.A.M.E', image: '/images/rifky.jpeg' },
    { name: 'Itmamul Wafa', role: 'Speaker G.A.M.E', image: '/images/wapa.png' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = `/api/certificate?name=${encodeURIComponent(formData.name)}`
    link.download = `Sertifikat-${formData.name.replace(/\s+/g, '-')}.pdf`
    link.click()
  }

  const StarRating = ({ rating, onRatingChange }: { rating: number, onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex gap-1 justify-center my-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-8 h-8 cursor-pointer transition-transform hover:scale-110 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-blue-200'
              }`}
            onClick={() => onRatingChange(star)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.18) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      {/* Floating Pill Header with Dropdown */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-5 px-4">
        {/* Main Pill */}
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-md rounded-full shadow-lg px-6 py-3.5 w-full max-w-lg relative z-50 border border-white/20">
          {/* Logo Replacement: asset1.png -> Back to Home */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/images/asset1.png" alt="Google Student Ambassador" className="h-10 w-auto object-contain" />
          </Link>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-full hover:bg-blue-50 transition-colors flex items-center justify-center cursor-pointer" 
            aria-label="Menu"
          >
            <Menu className="w-5 h-5 text-gray-600 hover:text-blue-500 transition-colors" strokeWidth={2.5} />
          </button>
        </div>

        {/* Dropdown Menu */}
        <div className={`absolute top-[76px] w-full max-w-lg px-4 transition-all duration-300 origin-top z-40 ${isMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'}`}>
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl mt-2 border border-blue-50 p-2 flex flex-col w-full">
            <Link href="#speaker" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Speaker
            </Link>
            <Link href="#form" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Form
            </Link>
            <Link href="#author" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Author
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-4xl px-4 py-8 mt-24 space-y-8 flex flex-col items-center">

        {/* Page Headlines */}
        {!submitted && (
          <div className="text-center mt-6 mb-2 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b] leading-tight drop-shadow-sm">
              Terima Kasih Telah Berpartisipasi!
            </h1>
            <p className="text-[#475467] font-medium max-w-xl mx-auto text-lg">
              Kami harap acara ini bermanfaat untukmu. Yuk berkenalan lagi dengan para pembicara hebat kita hari ini:
            </p>
          </div>
        )}

        {/* Scattered Instructor Cards */}
        {!submitted && (
          <div id="speaker" className="flex flex-wrap justify-center gap-x-8 gap-y-16 sm:gap-x-12 sm:gap-y-20 mt-8 mb-20 px-4 scroll-mt-32">
            {instructors.map((instructor, index) => {
              // Alternate rotations for a scattered look
              const rotations = ['rotate-[-3deg]', 'rotate-[4deg]', 'rotate-[-2deg]']
              // Alternate icons for the corners (7, 8, 9, 10)
              const topLeftIcon = `/images/asset${(index % 4) + 7}.png`
              const bottomRightIcon = `/images/asset${((index + 2) % 4) + 7}.png`

              return (
                <div
                  key={index}
                  className={`relative bg-white p-5 pb-7 rounded-[32px] shadow-2xl border-[5px] border-white transform transition-transform hover:scale-105 hover:z-10 w-72 sm:w-80 flex flex-col items-center ${rotations[index % rotations.length]}`}
                >
                  {/* Decorative Corner Icons */}
                  <img src={topLeftIcon} alt="Decoration" className="absolute -top-6 -left-6 w-14 h-14 object-contain drop-shadow-md z-20 pointer-events-none hover:rotate-12 transition-transform" />
                  <img src={bottomRightIcon} alt="Decoration" className="absolute -bottom-6 -right-6 w-14 h-14 object-contain drop-shadow-md z-20 pointer-events-none hover:-rotate-12 transition-transform" />

                  <div className="w-full aspect-[4/3] bg-blue-50/80 rounded-2xl flex items-center justify-center mb-5 overflow-hidden relative border border-blue-100">
                    {/* Instructor Photo */}
                    <img src={instructor.image} alt={instructor.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-extrabold text-gray-800 text-center text-lg leading-tight mb-1.5">{instructor.name}</h4>
                  <p className="text-sm text-[#0ea5e9] font-bold text-center">{instructor.role}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Author Section */}
        <div id="author" className="w-full flex flex-col items-center mb-10 mt-6 scroll-mt-32 px-4">
          <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Dipersembahkan oleh</p>
          <div className="relative bg-white p-4 sm:p-8 rounded-[28px] sm:rounded-[40px] shadow-2xl border-[4px] sm:border-[6px] border-white transform transition-transform hover:scale-[1.02] max-w-xl w-full flex flex-row items-center gap-4 sm:gap-8">
            
            {/* Decorative Corner Icons - Scaled for Mobile */}
            <img src="/images/asset7.png" alt="Decoration" className="absolute -top-4 -left-4 sm:-top-8 sm:-left-8 w-10 h-10 sm:w-16 sm:h-16 object-contain drop-shadow-md z-20 pointer-events-none" />
            <img src="/images/asset8.png" alt="Decoration" className="absolute -bottom-4 -right-4 sm:-bottom-8 sm:-right-8 w-10 h-10 sm:w-16 sm:h-16 object-contain drop-shadow-md z-20 pointer-events-none" />

            {/* Profile Photo Wrapper - Smaller for Mobile */}
            <div className="w-16 h-16 sm:w-32 sm:h-32 rounded-2xl sm:rounded-[32px] overflow-hidden border-2 sm:border-4 border-indigo-50 shadow-sm flex-shrink-0 relative bg-blue-50">
              <img src="/images/revan2.jpeg" alt="Eka Revandi" className="w-full h-full object-cover" />
            </div>
            
            {/* Text Content */}
            <div className="text-left flex-1 py-1">
              <h3 className="text-base sm:text-2xl font-extrabold text-gray-800 leading-tight">Eka Revandi</h3>
              <div className="flex flex-col items-start gap-1 mt-1 mb-1.5">
                <div className="bg-blue-50 text-[#3b82f6] text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full inline-block">Google Cloud Innovator</div>
                <div className="bg-indigo-50 text-indigo-600 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full inline-block">Technical Expert</div>
              </div>
              <p className="hidden sm:block text-sm text-gray-500 font-medium leading-normal">
                Dedicated Developer crafting digital experiences for the G.A.M.E ecosystem.
              </p>
            </div>
          </div>
        </div>

        {/* The Form Container */}
        <div id="form" className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/10 p-6 sm:p-10 w-full overflow-hidden border-2 border-blue-200 scroll-mt-24">
          <h2 className="text-[22px] sm:text-[26px] font-bold text-center text-[#475467] mb-8 leading-snug">
            {!submitted ? (
              <>Feedback Form <br /> <span className="text-[#0ea5e9]">Webinar Development</span></>
            ) : (
              <>Terima Kasih! <br /> <span className="text-green-500">Sertifikat Anda Siap</span></>
            )}
          </h2>

          <div className="space-y-6">
            {!submitted ? (
              <Card className="bg-[#eff6ff] border-0 overflow-hidden shadow-none">
                <CardContent className="p-6 sm:p-8 pt-6 sm:pt-8 flex flex-col">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      <div>
                        <label className="block text-sm font-semibold text-[#475467] mb-2">Nama Lengkap</label>
                        <Input
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Masukkan nama Anda"
                          className="bg-white border-0 shadow-sm rounded-full h-11 px-5 focus-visible:ring-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#475467] mb-2">Alamat Email</label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Masukkan email Anda"
                          className="bg-white border-0 shadow-sm rounded-full h-11 px-5 focus-visible:ring-blue-400"
                        />
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <label className="block text-sm font-semibold text-[#475467] mb-3">Rate webinar ini</label>
                      <StarRating
                        rating={formData.rating}
                        onRatingChange={(rating) => setFormData({ ...formData, rating })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#475467] mb-2">Feedback & Saran</label>
                      <Textarea
                        required
                        value={formData.feedback}
                        onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                        placeholder="Bagikan pendapat Anda mengenai materi dan pembicara..."
                        className="bg-white border-0 shadow-sm rounded-3xl min-h-[120px] p-5 focus-visible:ring-blue-400"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 text-lg font-semibold mt-4 shadow-md hover:shadow-lg transition-all"
                      disabled={!formData.name || !formData.email || !formData.feedback || formData.rating === 0}
                    >
                      Kirim Feedback
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#eff6ff] border-0 overflow-hidden shadow-none">
                <CardContent className="p-6 sm:p-8 pt-6 sm:pt-8 flex flex-col items-center text-center">
                  <div className="mb-6 w-24 h-24 rounded-full bg-gradient-to-tr from-green-400 to-green-200 flex items-center justify-center p-1 relative shadow-inner">
                    <div className="w-full h-full rounded-full bg-green-50 flex items-center justify-center border-4 border-white/40 overflow-hidden">
                      <Download className="w-10 h-10 text-green-600" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#0ea5e9] mb-6">Detail Sertifikat</h3>

                  <div className="bg-white/60 p-5 rounded-3xl border border-blue-50 w-full mb-8">
                    <p className="text-[#475467] mb-2"><strong className="text-gray-800">Peserta:</strong> {formData.name}</p>
                    <p className="text-[#475467] mb-2"><strong className="text-gray-800">Email:</strong> {formData.email}</p>
                    <p className="text-[#475467]"><strong className="text-gray-800">Rating:</strong> {formData.rating}/5 stars</p>
                  </div>

                  <Button
                    onClick={handleDownload}
                    className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Unduh Sertifikat (PDF)
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
