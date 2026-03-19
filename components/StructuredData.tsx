export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GSA Alumni Portal",
    "description": "Platform eksklusif bagi alumni Google Student Ambassador (GSA) untuk tetap terkoneksi, berbagi program baru, dan tips berkembang di ekosistem Google.",
    "url": "https://googlestudentambassador-alumni25.my.id",
    "logo": "https://googlestudentambassador-alumni25.my.id/images/site-icon.png",
    "sameAs": [
      "https://developers.google.com/community/gsa"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Indonesian", "English"]
    },
    "memberOf": {
      "@type": "Organization",
      "name": "Google for Developers",
      "url": "https://developers.google.com/"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}