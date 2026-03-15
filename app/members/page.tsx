/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { GSAMemberData } from '@/contexts/AuthContext'

interface MemberWithId extends GSAMemberData {
  id: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<MemberWithId[]>([])

  useEffect(() => {
    const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MemberWithId[]
      setMembers(membersData)
    })
    return () => unsubscribe()
  }, [])

  const getTierColor = (tier?: string) => {
    switch(tier) {
      case 'Rising Star': return 'bg-blue-100 text-blue-600'
      case 'Achiever': return 'bg-pink-100 text-pink-600'
      case 'Stabilizer': return 'bg-purple-100 text-purple-600'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.18) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative z-10 w-full max-w-4xl px-4 py-8 mt-8">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 mb-6">
          <ArrowLeft className="w-5 h-5" /> Kembali ke Beranda
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b] mb-3 text-center">
          Semua Member <span className="text-[#0ea5e9]">GSA</span>
        </h1>
        <p className="text-gray-500 text-center mb-10">Total {members.length} member terdaftar</p>

        <div className="space-y-6">
          {members.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 font-medium">Belum ada member terdaftar.</p>
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="relative bg-white p-6 sm:p-8 rounded-[32px] shadow-lg border-4 border-white hover:shadow-xl transition-all">
                <img src="/images/asset7.png" alt="Decoration" className="absolute -top-4 -left-4 w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md z-20 pointer-events-none" />
                <img src="/images/asset8.png" alt="Decoration" className="absolute -bottom-4 -right-4 w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md z-20 pointer-events-none" />

                <div className="flex flex-row items-center gap-4 sm:gap-6">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-[28px] overflow-hidden border-4 border-blue-50 shadow-sm flex-shrink-0 bg-blue-50">
                    <img 
                      src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=3b82f6&color=fff`} 
                      alt={member.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-2xl font-extrabold text-gray-800 leading-tight mb-2">{member.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {member.tier && (
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${getTierColor(member.tier)}`}>
                          {member.tier}
                        </span>
                      )}
                      {member.gsaId && (
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                          {member.gsaId}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{member.campus}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
