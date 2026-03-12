import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CartSyncProvider } from '@/components/providers/cart-sync-provider'

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartSyncProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartSyncProvider>
  )
}
