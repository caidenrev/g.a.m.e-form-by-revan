interface ArticleSchemaProps {
  title: string
  description: string
  author: string
  publishedDate: string
  imageUrl?: string
  url: string
}

export default function ArticleSchema({ 
  title, 
  description, 
  author, 
  publishedDate, 
  imageUrl, 
  url 
}: ArticleSchemaProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "author": {
      "@type": "Person",
      "name": author
    },
    "datePublished": publishedDate,
    "dateModified": publishedDate,
    "publisher": {
      "@type": "Organization",
      "name": "GSA Alumni Portal",
      "logo": {
        "@type": "ImageObject",
        "url": "https://googlestudentambassador-alumni25.my.id/images/site-icon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    ...(imageUrl && {
      "image": {
        "@type": "ImageObject",
        "url": imageUrl,
        "width": 1200,
        "height": 630
      }
    })
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}