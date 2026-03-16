/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="w-full bg-white border-t border-blue-50 py-10 px-4 mt-20">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img src="/images/asset1.png" alt="Google Student Ambassador" className="h-8 w-auto object-contain" />
        </Link>
        
        <div className="text-center space-y-1">
          <p className="text-gray-400 text-[10px] font-semibold tracking-wide uppercase">
            &copy; {currentYear} Google Student Ambassador Community
          </p>
        </div>
      </div>
    </footer>
  )
}
