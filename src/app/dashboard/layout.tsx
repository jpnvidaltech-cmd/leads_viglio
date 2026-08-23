"use client";

import { ReactNode, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  GraduationCap,
  Package,
  FileCode,
  Users,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAdmin = session?.user?.role === "admin";

  const navigation = [
    { name: "Seguimiento Leads", href: "/dashboard", icon: MessageSquare },
    { name: "Cursos y Ediciones", href: "/dashboard/cursos", icon: GraduationCap },
    { name: "Productos & Equipamiento", href: "/dashboard/productos", icon: Package },
    { name: "Librería Digital STL", href: "/dashboard/catalogo-digital", icon: FileCode },
  ];

  const adminNavigation = [
    { name: "Gestión de Usuarios", href: "/dashboard/usuarios", icon: Users },
  ];

  const userNavigation = [
    { name: "Mi Cuenta", href: "/dashboard/perfil", icon: User },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
          <p className="text-sm font-semibold text-gray-500">Cargando backoffice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Sidebar Back Drop */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Component (Desktop and Mobile Drawer) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Logo Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-gray-100 bg-white">
          <Link href="/dashboard" className="flex flex-col">
            <span className="text-xl font-extrabold text-[var(--color-primary)] tracking-wide">
              PÉREZ GIUGOVAZ
            </span>
            <span className="text-xs font-semibold text-gray-400">
              Odontología Digital
            </span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-900 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 space-y-8">
          {/* Main Navigation */}
          <div>
            <span className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
              Navegación
            </span>
            <nav className="mt-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`group flex items-center px-3 py-3 text-sm font-semibold rounded-[var(--radius-custom)] transition-all ${
                      isActive
                        ? "bg-[var(--color-primary)] text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)]"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-[var(--color-primary)]"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Admin Navigation */}
          {isAdmin && (
            <div>
              <span className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Administración
              </span>
              <nav className="mt-2 space-y-1">
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`group flex items-center px-3 py-3 text-sm font-semibold rounded-[var(--radius-custom)] transition-all ${
                        isActive
                          ? "bg-[var(--color-primary)] text-white"
                          : "text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)]"
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                          isActive
                            ? "text-white"
                            : "text-gray-400 group-hover:text-[var(--color-primary)]"
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Account settings */}
          <div>
            <span className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
              Mi Perfil
            </span>
            <nav className="mt-2 space-y-1">
              {userNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`group flex items-center px-3 py-3 text-sm font-semibold rounded-[var(--radius-custom)] transition-all ${
                      isActive
                        ? "bg-[var(--color-primary)] text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)]"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-[var(--color-primary)]"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer with Logged In User Info */}
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex flex-col truncate max-w-[180px]">
              <span className="text-sm font-bold text-gray-700 truncate">
                {session?.user?.name || "Administrador"}
              </span>
              <span className="text-xs text-gray-400 truncate">
                {session?.user?.email}
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                {isAdmin ? (
                  <>
                    <ShieldCheck className="h-4.5 w-4.5 text-[var(--color-primary)]" />
                    <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-xs font-bold text-[var(--color-primary)] border border-sky-100">
                      Administrador
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4.5 w-4.5 text-amber-600" />
                    <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-100">
                      Solo Lectura
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-custom)] text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar for Mobile */}
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-6 lg:hidden">
          <Link href="/dashboard" className="flex flex-col">
            <span className="text-lg font-extrabold text-[var(--color-primary)] tracking-wide">
              PÉREZ GIUGOVAZ
            </span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-900 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6 md:p-8">
          <div className="mx-auto max-w-7xl h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
