/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import Link from 'next/link'
import { ArrowLeft, Search, Linkedin, Instagram, Menu, LogIn } from 'lucide-react'
import { GSAMemberData, useAuth } from '@/contexts/AuthContext'
import Footer from '@/components/Footer'

interface MemberWithId extends GSAMemberData {
  id: string;
}

export default function MembersPage() {
  const { user } = useAuth()
  const [members, setMembers] = useState<MemberWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMember, setSelectedMember] = useState<MemberWithId | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MemberWithId[]
      setMembers(membersData)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.campus && member.campus.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getTierColor = (tier?: string) => {
    switch(tier) {
      case 'Rising Star': return 'bg-blue-100 text-blue-600'
      case 'Achiever': return 'bg-pink-100 text-pink-600'
      case 'Stabilizer': return 'bg-purple-100 text-purple-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.18) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      {/* Floating Pill Header */}
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

      <div className="relative z-10 w-full max-w-6xl px-4 pt-28 pb-20 flex flex-col items-center">
        <div className="text-center mb-8 space-y-4 w-full">
          <h1 className="text-3xl sm:text-5xl font-black text-[#1e293b] tracking-tight">
            Semua Member <span className="text-[#0ea5e9]">GSA</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-lg mx-auto">
            Wadah kolaborasi dan jaringan alumni Google Student Ambassador. Total {members.length} member terdaftar.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto w-full relative mt-8">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau kampus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-white shadow-lg rounded-full py-4 pl-14 pr-6 text-gray-700 font-bold focus:outline-none focus:border-blue-400 transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[4/5] bg-white rounded-[32px] animate-pulse"></div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-[40px] border-2 border-dashed border-gray-200 w-full max-w-2xl px-6">
            <p className="text-gray-500 font-bold">
              {searchTerm ? `Tidak ada member yang cocok dengan "${searchTerm}"` : 'Belum ada member terdaftar.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-x-10 sm:gap-y-16 w-full px-2 sm:px-4">
            {filteredMembers.map((member, index) => {
              const rotations = ['rotate-[-2deg]', 'rotate-[3deg]', 'rotate-[-1deg]', 'rotate-[2deg]']
              const topLeftIcon = `/images/asset${(index % 4) + 7}.png`
              const bottomRightIcon = `/images/asset${((index + 2) % 4) + 7}.png`

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`relative bg-white p-3 pb-5 sm:p-5 sm:pb-7 rounded-[24px] sm:rounded-[32px] shadow-xl border-[4px] sm:border-[5px] border-white transform transition-transform hover:scale-105 hover:z-10 flex flex-col items-center cursor-pointer ${rotations[index % rotations.length]}`}
                >
                  {/* Decorative Corner Icons */}
                  <img src={topLeftIcon} alt="" className="absolute -top-3 -left-3 sm:-top-6 sm:-left-6 w-8 h-8 sm:w-14 sm:h-14 object-contain drop-shadow-md z-20 pointer-events-none" />
                  <img src={bottomRightIcon} alt="" className="absolute -bottom-3 -right-3 sm:-bottom-6 sm:-right-6 w-8 h-8 sm:w-14 sm:h-14 object-contain drop-shadow-md z-20 pointer-events-none" />

                  <div className="w-full aspect-[4/3] bg-blue-50/80 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-5 overflow-hidden relative border border-blue-100 shadow-inner">
                    <img
                      src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=3b82f6&color=fff`}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h4 className="font-extrabold text-gray-800 text-center text-xs sm:text-lg leading-tight mb-1 sm:mb-1.5 line-clamp-1 w-full px-1">{member.name}</h4>
                  
                  <div className="flex flex-wrap justify-center items-center gap-1 mb-1 sm:mb-2">
                    {member.tier && (
                      <span className={`text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${getTierColor(member.tier)}`}>
                        {member.tier}
                      </span>
                    )}
                    {member.gsaId && (
                      <span className="bg-gray-100 text-gray-600 text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                        {member.gsaId}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[9px] sm:text-sm text-[#0ea5e9] font-bold text-center line-clamp-1 w-full px-1">{member.campus}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detailed Member Popup */}
      {selectedMember && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedMember(null)}
        >
          <div 
            className="relative bg-white p-6 pb-10 sm:p-10 sm:pb-14 rounded-[40px] shadow-2xl border-[10px] border-white max-w-lg w-full transform animate-in zoom-in-95 duration-300 flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute -top-4 -right-4 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-30"
            >
              <span className="text-2xl font-black">×</span>
            </button>

            {/* Polaroid Decorative Icons */}
            <img src="/images/asset7.png" alt="" className="absolute -top-8 -left-8 w-20 h-20 object-contain drop-shadow-xl z-20 pointer-events-none" />
            <img src="/images/asset10.png" alt="" className="absolute -bottom-8 -right-8 w-24 h-24 object-contain drop-shadow-xl z-20 pointer-events-none" />

            <div className="w-full aspect-square bg-blue-50/80 rounded-3xl flex items-center justify-center mb-8 overflow-hidden relative border-2 border-blue-100 shadow-inner">
              <img
                src={selectedMember.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.name)}&background=3b82f6&color=fff`}
                alt={selectedMember.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full space-y-4">
              <h3 className="text-3xl font-black text-gray-800 text-center leading-tight break-words">
                {selectedMember.name}
              </h3>
              
              <div className="flex flex-wrap justify-center items-center gap-3">
                {selectedMember.tier && (
                  <span className={`text-sm font-black px-4 py-1.5 rounded-full shadow-sm border-2 border-current/10 ${getTierColor(selectedMember.tier)}`}>
                    {selectedMember.tier}
                  </span>
                )}
                {selectedMember.gsaId && (
                  <span className="bg-gray-100 text-gray-700 text-sm font-black px-4 py-1.5 rounded-full shadow-sm border-2 border-gray-200">
                    {selectedMember.gsaId}
                  </span>
                )}
              </div>
              
              <div className="pt-2">
                <p className="text-xl text-[#0ea5e9] font-black text-center break-words bg-blue-50 py-3 px-6 rounded-2xl border border-blue-100">
                  {selectedMember.campus}
                </p>
              </div>

               {/* Social Media Links */}
               {(selectedMember.linkedIn || selectedMember.instagram) && (
                 <div className="flex justify-center gap-4 pt-4">
                   {selectedMember.linkedIn && (
                     <a 
                       href={selectedMember.linkedIn.startsWith('http') ? selectedMember.linkedIn : `https://${selectedMember.linkedIn}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="flex items-center gap-2 bg-[#0077b5] text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:scale-105 transition-transform"
                     >
                       <Linkedin className="w-5 h-5" />
                       <span className="hidden sm:inline">LinkedIn</span>
                     </a>
                   )}
                   {selectedMember.instagram && (
                     <a 
                       href={selectedMember.instagram.startsWith('http') ? selectedMember.instagram : `https://${selectedMember.instagram}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="flex items-center gap-2 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:scale-105 transition-transform"
                     >
                       <Instagram className="w-5 h-5" />
                       <span className="hidden sm:inline">Instagram</span>
                     </a>
                   )}
                 </div>
               )}
             </div>
           </div>
         </div>
       )}

      <Footer />
    </div>
  )
}
