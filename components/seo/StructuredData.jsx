export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://loreshifoodhub.vercel.app/#organization",
        name: "Loreshi FoodHub",
        url: "https://loreshifoodhub.vercel.app",
        email: "loreshifoodhub24@gmail.com",
        telephone: "+2348056710073",
        sameAs: [
          "https://www.instagram.com/loreshi_foodhub",
          "https://www.tiktok.com/@loreshi_foodhub24",
          "https://web.facebook.com/loreshifoodhub",
        ],
      },

      {
        "@type": "WebSite",
        "@id": "https://loreshifoodhub.vercel.app/#website",
        url: "https://loreshifoodhub.vercel.app",
        name: "Loreshi FoodHub",
        description:
          "Shop quality Nigerian foodstuff online from Loreshi FoodHub.",
        publisher: {
          "@id":
            "https://loreshifoodhub.vercel.app/#organization",
        },
        inLanguage: "en-NG",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          structuredData
        ),
      }}
    />
  );
}