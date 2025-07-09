import { AppProvider } from '@/components/AppContext';
import Header from '@/components/dashboard/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex">
          {children}
        </main>
      </div>
    </AppProvider>
  );
}
