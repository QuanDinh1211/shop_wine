import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WineVault - Cửa hàng rượu vang cao cấp',
  description: 'Khám phá bộ sưu tập rượu vang cao cấp từ khắp nơi trên thế giới. Chất lượng đảm bảo, giá cả hợp lý.',
  keywords: 'rượu vang, wine, rượu vang đỏ, rượu vang trắng, champagne, rượu vang cao cấp',
  openGraph: {
    title: 'WineVault - Cửa hàng rượu vang cao cấp',
    description: 'Khám phá bộ sưu tập rượu vang cao cấp từ khắp nơi trên thế giới.',
    type: 'website',
    locale: 'vi_VN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}