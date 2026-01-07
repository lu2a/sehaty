import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'صحتي AI',
    short_name: 'صحتي',
    description: 'رعاية صحية ذكية وشاملة للأسرة العربية',
    start_url: '/dashboard', // الصفحة التي يفتح عليها التطبيق
    display: 'standalone', // إخفاء شريط المتصفح ليبدو كتطبيق أصلي
    background_color: '#ffffff',
    theme_color: '#2563eb', // اللون الأزرق الطبي
    orientation: 'portrait',
    dir: 'rtl',
    lang: 'ar',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}