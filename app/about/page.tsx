/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Menu, LogIn } from 'lucide-react'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'

export default function AboutPage() {
  const { user } = useAuth()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [feedback, setFeedback] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSendFeedback = () => {
    if (!feedback.trim()) return
    const subject = encodeURIComponent('Saran & Masukan Portal GSA')
    const body = encodeURIComponent(feedback)
    window.location.href = `mailto:ekarevandii@gmail.com?subject=${subject}&body=${body}`
  }

  const faqData = [
    {
      label: 'Tentang Portal Ini',
      content: '"Jadi sebenernya Portal ini tuh adalah web app generate Sertif buat para peserta yang ikut event webinar G.A.M.E kemaren, nah kata gua kok boleh boleh juga ni kalo migrate jadi portal buat my family gue GSA, yaudah gua puter otak ubah skema flow, arsitektur dari DB, FlowSystem sampe ke logic nya biar proper sikit. nah disini juga gua mau ngerasain buat temen temen GSA gimana sih rasanya masuk web GSA dicoding yang dimana member member tertentu aja, ya walaupun masih bagusan punya dicoding sih awkaokowk, dan gua tuh mau everyone can feel the same vibe anjasss. btw makasih juga ka taufiq, yang baik hati bijak ganteng dan ga sombong udah mau support kita as a GSA 25. btw makasih google thr nya aku jadi bisa nyimpen uang cash aku buat bayar tagihan CLOUDDDDDDDDD #KeluhKesahCloudEnjinerrr"'
    },
    {
      label: 'Roles & Expertise',
      content: ''
    },
    {
      label: 'Campus & Community',
      content: 'Aktif berkontribusi di komunitas IT dan ekosistem Google Student Ambassadors untuk berbagi ilmu.'
    },
    {
      label: 'Saran & Masukan',
      content: ''
    }
  ]
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center">
      {/* Grid background */}
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

      {/* Main Content Wrapper with Offset */}
      <div className="relative z-10 w-full max-w-4xl px-4 pt-28 pb-8 flex flex-col items-center">

        {/* Hero Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1e293b] leading-tight drop-shadow-sm">
            Tentang <span className="text-[#0ea5e9]">Portal GSA</span>
          </h1>
          <p className="text-[#475467] font-medium max-w-2xl mx-auto text-lg leading-relaxed">
            Wadah kolaborasi bagi alumni dan member GSA untuk tetap saling berkoneksi, berbagi informasi program terbaru, dan berkembang bersama di ekosistem Google.
          </p>
        </div>

        {/* Content Section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 px-4">
          <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-white transform transition-transform hover:scale-[1.03]">
            <img src="/images/asset6.png" alt="Ekosistem Terkoneksi" className="w-32 h-32 object-contain mb-6 drop-shadow-sm" />
            <h3 className="text-xl font-bold text-gray-800 mb-3">Ekosistem Terkoneksi</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              Memastikan seluruh alumni dan member GSA tetap saling terhubung untuk berkolaborasi dan terus berkembang di dalam ekosistem Google.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-white transform transition-transform hover:scale-[1.03]">
            <img src="/images/site-icon.png" alt="Sharing" className="w-24 h-24 object-contain mb-6 drop-shadow-sm" />
            <h3 className="text-xl font-bold text-gray-800 mb-3">Alumni Sharing</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              Wadah bagi para alumni untuk saling berbagi informasi mengenai program-program terbaru dari Google agar komunitas tetap update.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-white transform transition-transform hover:scale-[1.03]">
            <img src="/images/asset5.png" alt="Tips" className="w-24 h-24 object-contain mb-6 drop-shadow-sm" />
            <h3 className="text-xl font-bold text-gray-800 mb-3">Tips & Tricks</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              Berbagi wawasan, tips, dan trik eksklusif untuk memaksimalkan potensi diri dan tumbuh bersama di dalam komunitas Google.
            </p>
          </div>
        </div>

        {/* Author Section - Refined Stacked */}
        <div className="w-full max-w-2xl mb-20 flex flex-col items-center gap-10">
          {/* Header (Top) */}
          <div className="text-center mb-2">
            <p className="text-blue-600 font-extrabold tracking-widest text-[10px] sm:text-xs uppercase mb-1">The Architect</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1e293b] leading-tight">Eka Revandi</h2>
          </div>

          {/* Photo (Middle) - Full Width on Mobile */}
          <div className="w-full max-w-[380px] sm:w-96 flex-shrink-0 relative z-10">
            <img
              src="/images/eka-revandi.png"
              alt="Eka Revandi"
              className="w-full h-auto object-contain drop-shadow-[0_30px_100px_rgba(59,130,246,0.4)] animate-float"
            />
          </div>

          {/* Info Side (Bottom - Deconstructed Items) */}
          <div className="w-full z-20">
            <div className="bg-transparent p-0 sm:p-2">

              {/* FAQ Style Rows - White Fill & Shadow */}
              <div className="flex flex-col gap-4">
                {faqData.map((item, idx) => (
                  <div key={idx} className="rounded-[32px] border-2 border-blue-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all overflow-hidden group hover:shadow-[0_15px_40px_rgba(59,130,246,0.08)]">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between px-6 py-5 transition-all duration-300 group rounded-[32px]"
                    >
                      <span className={`text-xs sm:text-base font-extrabold uppercase tracking-wider text-left transition-colors ${openFaq === idx ? 'text-blue-600' : 'text-[#475467] group-hover:text-blue-500'}`}>
                        {item.label}
                      </span>
                      <div className={`p-2 rounded-xl transition-all ${openFaq === idx ? 'bg-blue-50 text-blue-600' : 'text-blue-100 group-hover:text-blue-400'}`}>
                        {openFaq === idx ? (
                          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </div>
                    </button>

                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="px-6 pb-6 pt-2">
                        {item.label === 'Roles & Expertise' ? (
                          <div className="space-y-6">
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2">
                              {[
                                { label: 'Cloud Innovator', bg: 'bg-blue-50/50', text: 'text-blue-700', border: 'border-blue-100' },
                                { label: 'Technical Expert', bg: 'bg-indigo-50/50', text: 'text-indigo-700', border: 'border-indigo-100' },
                                { label: 'Software Engineer II', bg: 'bg-orange-50/50', text: 'text-orange-700', border: 'border-orange-100' }
                              ].map((badge, bIdx) => (
                                <span key={bIdx} className={`${badge.bg} ${badge.text} ${badge.border} border text-[10px] font-extrabold px-4 py-1.5 rounded-full`}>
                                  {badge.label}
                                </span>
                              ))}
                            </div>

                            {/* Partnership Logos inside Dropdown - COLORED */}
                            <div className="pt-6 border-t border-blue-50">
                              <p className="text-[10px] font-medium text-[#475467] mb-4 lowercase italic">Special Thanks for</p>
                              <div className="flex items-center gap-6">
                                <img src="/images/google-logo.png" alt="Google Cloud" className="h-5 sm:h-6 w-auto object-contain" />
                                <img src="/images/dicoding-logo.png" alt="Dicoding" className="h-5 sm:h-6 w-auto object-contain" />
                                <img src="/images/site-icon.png" alt="Portal GSA" className="h-6 sm:h-8 w-auto object-contain" />
                              </div>
                            </div>
                          </div>
                        ) : item.label === 'Saran & Masukan' ? (
                          <div className="space-y-4 pt-2">
                            <textarea
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="Tulis saran atau masukan Anda di sini..."
                              className="w-full h-32 p-4 rounded-2xl border-2 border-blue-50 bg-blue-50/10 focus:border-blue-200 focus:bg-white outline-none transition-all text-sm font-medium text-gray-600 placeholder:text-gray-400"
                            />
                            <button
                              onClick={handleSendFeedback}
                              className="w-full py-3 rounded-xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                            >
                              Kirim
                            </button>
                          </div>
                        ) : (
                          <p className={`text-sm sm:text-base leading-relaxed font-medium ${item.label === 'Tentang Saya' ? 'italic text-blue-700/80 border-l-4 border-blue-100 pl-4' : 'text-gray-500'}`}>
                            {item.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  )
}
