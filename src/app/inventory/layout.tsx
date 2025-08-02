'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '🏠' },
    { href: '/inventory/entrada', label: 'Entrada', icon: '📸' },
    { href: '/inventory/saida', label: 'Saída', icon: '📱' },
    { href: '/inventory/estoque', label: 'Estoque', icon: '📊' },
    { href: '/inventory/historico', label: 'Histórico', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header com navegação */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Controle de Uniformes</h1>
                <p className="text-sm text-gray-600">Sistema de Estoque</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname === item.href ? 'default' : 'ghost'}
                    className={cn(
                      'flex items-center gap-2',
                      pathname === item.href 
                        ? 'bg-[#8c288a] text-white hover:bg-[#7a2478]' 
                        : 'text-gray-700 hover:bg-[#8c288a]/10 hover:text-[#8c288a]'
                    )}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Menu mobile */}
            <div className="md:hidden">
              <select
                className="px-3 py-2 border rounded-md bg-white text-gray-700"
                value={pathname}
                onChange={(e) => window.location.href = e.target.value}
              >
                {navItems.map((item) => (
                  <option key={item.href} value={item.href}>
                    {item.icon} {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="border-b bg-gray-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#8c288a]">
              Início
            </Link>
            {pathname !== '/' && (
              <>
                <span>/</span>
                <span className="text-[#8c288a] font-medium">
                  {navItems.find(item => item.href === pathname)?.label || 'Página'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-8 bg-white">
        {children}
      </main>
    </div>
  );
}
