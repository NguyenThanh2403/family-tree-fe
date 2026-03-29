import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main id="main-content" className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
