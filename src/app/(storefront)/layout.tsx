import { Suspense } from 'react';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Toaster } from '@/components/ui/Toast';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Suspense>{children}</Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <Toaster />
    </>
  );
}
