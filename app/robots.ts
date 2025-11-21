import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taemni.dev';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/write', '/login'], // 관리자 페이지는 크롤링 제외
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
