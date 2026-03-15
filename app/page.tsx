/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { Calendar, Menu, LogIn, LogOut, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { useAuth, GSAMemberData } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  imageUrl?: string;
  createdAt?: Timestamp;
  author: string;
  authorId: string;
  authorPhoto?: string;
  authorTier?: 'Rising Star' | 'Achiever' | 'Stabilizer';
  authorCampus?: string;
}

interface MemberWithId extends GSAMemberData {
  id: string;
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [members, setMembers] = useState<MemberWithId[]>([])

  useEffect(() => {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[]
      setBlogPosts(postsData)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MemberWithId[]
      setMembers(membersData.slice(0, 10)) // Max 10 members
    })
    return () => unsubscribe()
  }, [])

  const instructors = [
    { name: 'Eka Revandi', role: 'Speaker G.A.M.E', image: '/images/revan.jpeg' },
    { name: 'Rifky Akbar Utomo', role: 'Speaker G.A.M.E', image: '/images/rifky.jpeg' },
    { name: 'Itmamul Wafa', role: 'Speaker G.A.M.E', image: '/images/wapa.png' }
  ]



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
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/images/asset1.png" alt="Google Student Ambassador" className="h-10 w-auto object-contain" />
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
            <Link href="#speaker" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Speaker
            </Link>
            <Link href="#members" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Members
            </Link>
            <Link href="#blog" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Blog
            </Link>
            <Link href="#author" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors">
              Author
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
                <Link href="/my-articles" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Artikel Saya
                </Link>
                <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="px-5 py-3.5 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                </Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="px-5 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-colors flex items-center gap-2 w-full text-left">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-4xl px-4 py-8 mt-24 space-y-8 flex flex-col items-center">

        {/* Page Headlines */}
        <div className="text-center mt-6 mb-2 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b] leading-tight drop-shadow-sm">
            Selamat Datang di Portal Kami!
          </h1>
          <p className="text-[#475467] font-medium max-w-xl mx-auto text-lg">
            Temukan artikel-artikel menarik dan informatif, serta kenali lebih jauh para ahlinya di bawah ini:
          </p>
        </div>

        {/* Scattered Instructor Cards */}
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

        {/* List Member Section */}
        <div id="members" className="w-full flex flex-col items-center mb-16 mt-12 scroll-mt-32">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#475467] mb-3 leading-snug">
            Member <span className="text-[#0ea5e9]">GSA</span>
          </h2>
          <p className="text-gray-500 text-sm mb-8">Google Student Ambassador Community</p>
          
          {members.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 font-medium">Belum ada member terdaftar.</p>
            </div>
          ) : (
            <>
              {/* Member Cards Carousel - Full width without any horizontal padding */}
              <div className="w-full overflow-hidden py-12">
                <div className="flex animate-scroll-left gap-x-8 sm:gap-x-12 hover:pause cursor-grab active:cursor-grabbing" 
                     onMouseEnter={(e) => e.currentTarget.style.animationPlayState = 'paused'}
                     onMouseLeave={(e) => e.currentTarget.style.animationPlayState = 'running'}>
                  {/* Duplicate members for seamless loop */}
                  {[...members, ...members, ...members].map((member, index) => {
                    const getTierColor = (tier?: string) => {
                      switch(tier) {
                        case 'Rising Star': return 'bg-blue-100 text-blue-600'
                        case 'Achiever': return 'bg-pink-100 text-pink-600'
                        case 'Stabilizer': return 'bg-purple-100 text-purple-600'
                        default: return 'bg-gray-100 text-gray-600'
                      }
                    }

                    // Alternate rotations for scattered look
                    const rotations = ['rotate-[-3deg]', 'rotate-[4deg]', 'rotate-[-2deg]']
                    // Alternate icons for corners
                    const topLeftIcon = `/images/asset${(index % 4) + 7}.png`
                    const bottomRightIcon = `/images/asset${((index + 2) % 4) + 7}.png`

                    return (
                      <div
                        key={`${member.id}-${index}`}
                        className={`relative bg-white p-5 pb-7 rounded-[32px] shadow-2xl border-[5px] border-white transform transition-transform hover:scale-105 hover:z-10 w-72 sm:w-80 flex flex-col items-center ${rotations[index % rotations.length]} flex-shrink-0`}
                      >
                        {/* Decorative Corner Icons */}
                        <img src={topLeftIcon} alt="Decoration" className="absolute -top-6 -left-6 w-14 h-14 object-contain drop-shadow-md z-20 pointer-events-none hover:rotate-12 transition-transform" />
                        <img src={bottomRightIcon} alt="Decoration" className="absolute -bottom-6 -right-6 w-14 h-14 object-contain drop-shadow-md z-20 pointer-events-none hover:-rotate-12 transition-transform" />

                        <div className="w-full aspect-[4/3] bg-blue-50/80 rounded-2xl flex items-center justify-center mb-5 overflow-hidden relative border border-blue-100">
                          {/* Member Photo */}
                          <img 
                            src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=3b82f6&color=fff`} 
                            alt={member.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        
                        <h4 className="font-extrabold text-gray-800 text-center text-lg leading-tight mb-1.5">{member.name}</h4>
                        
                        <div className="flex flex-wrap justify-center items-center gap-1 mb-2">
                          {member.tier && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getTierColor(member.tier)}`}>
                              {member.tier}
                            </span>
                          )}
                          {member.gsaId && (
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {member.gsaId}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-[#0ea5e9] font-bold text-center">{member.campus}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {members.length >= 10 && (
                <Link href="/members" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all">
                  View More Members
                </Link>
              )}
            </>
          )}
        </div>

        {/* The Blog Container */}
        <div id="blog" className="w-full flex flex-col items-center mb-16 scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#475467] mb-8 leading-snug">
            Artikel <span className="text-[#0ea5e9]">Terbaru</span>
          </h2>

          <div className="w-full space-y-8">
            {blogPosts.length === 0 ? (
               <div className="text-center py-10">
                 <p className="text-gray-500 font-medium">Belum ada artikel yang diterbitkan.</p>
               </div>
            ) : (
              blogPosts.map((post) => {
                const getTierColor = (tier?: string) => {
                  switch(tier) {
                    case 'Rising Star': return 'bg-blue-100 text-blue-600'
                    case 'Achiever': return 'bg-pink-100 text-pink-600'
                    case 'Stabilizer': return 'bg-purple-100 text-purple-600'
                    default: return 'bg-gray-100 text-gray-600'
                  }
                }

                return (
                  <Link key={post.id} href={`/blog/${post.id}`}>
                    <div className="relative bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[32px] shadow-lg border-4 border-white hover:shadow-xl transition-all group">
                      <img src="/images/asset9.png" alt="Decoration" className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-8 h-8 sm:w-12 sm:h-12 object-contain drop-shadow-md z-20 pointer-events-none" />
                      <img src="/images/asset10.png" alt="Decoration" className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-8 h-8 sm:w-12 sm:h-12 object-contain drop-shadow-md z-20 pointer-events-none" />

                      <div className="flex flex-row items-center gap-4 sm:gap-8">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-[28px] overflow-hidden border-3 sm:border-4 border-blue-50 shadow-sm flex-shrink-0 bg-blue-50">
                          <img 
                            src={post.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=3b82f6&color=fff`} 
                            alt={post.author} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        </div>

                        <div className="flex-1 space-y-2 sm:space-y-2.5">
                          <h3 className="text-base sm:text-2xl font-extrabold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">{post.title}</h3>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="bg-blue-100 text-[#0ea5e9] text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider">{post.category}</span>
                            {post.authorTier && (
                              <span className={`text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${getTierColor(post.authorTier)}`}>
                                {post.authorTier}
                              </span>
                            )}
                            {post.createdAt && (
                              <span className="text-gray-400 text-[10px] sm:text-xs font-semibold flex items-center gap-1">
                                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> 
                                {post.createdAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 font-medium line-clamp-2">{post.excerpt}</p>
                          <p className="text-xs sm:text-sm text-gray-500 font-medium">
                            {post.author} {post.authorCampus && `• ${post.authorCampus}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
