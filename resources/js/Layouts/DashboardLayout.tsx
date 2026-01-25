import { PropsWithChildren } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Leaf, LayoutDashboard, Plus, List, LogOut, PenSquare, BookText, Mail, GraduationCap, Users, ShoppingCart, Settings } from 'lucide-react';

export default function DashboardLayout({ children }: PropsWithChildren) {
  const { auth } = usePage().props as any;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 text-white p-6 space-y-6" style={{ backgroundColor: '#5a7a5a' }}>
        <div className="flex items-center gap-2 mb-8">
          <Leaf style={{ color: '#ffffff' }} size={32} />
          <a href={route('home')} target="_blank"><h2 className="text-xl font-bold">Project Archive</h2></a>
        </div>
        <nav className="flex flex-col space-y-3">
          <Link
            href={route('dashboard')}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link
            href={route('admin.projects.create')}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <Plus size={18} />
            Create Project
          </Link>
          <Link
            href={route('admin.projects.index')}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <List size={18} />
            Project List
          </Link>
          <Link
            href={route('admin.posts.create')}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors mt-4"
          >
            <PenSquare size={18} />
            Create Writing
          </Link>
          <Link
            href={route('admin.posts.index')}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <BookText size={18} />
            Writing List
          </Link>
          <Link
            href={route('admin.newsletter.index')}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors mt-4"
          >
            <Mail size={18} />
            Newsletter
          </Link>
          <Link
            href={route('admin.courses.create')}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors mt-4"
          >
            <Plus size={18} />
            Create Course
          </Link>
          <Link
            href={route('admin.courses.index')}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <GraduationCap size={18} />
            Courses
          </Link>
          <Link
            href={route('admin.users.index')}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors mt-4"
          >
            <Users size={18} />
            Users
          </Link>
          <Link
            href={route('admin.purchases.index')}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <ShoppingCart size={18} />
            Purchases
          </Link>
          <Link
            href={route('admin.settings')}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors mt-4"
          >
            <Settings size={18} />
            Settings
          </Link>
          <button
            onClick={() => router.post(route('logout'))}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-left hover:bg-red-500/20 transition-colors mt-8"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6" style={{ backgroundColor: '#f9f8f6' }}>
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold" style={{ color: '#3d3d3d' }}>Admin Area</h1>
          <button
            onClick={() => router.post(route('logout'))}
            className="text-sm text-white px-4 py-2 rounded-md hover:opacity-90 transition"
            style={{ backgroundColor: '#7a9d7a' }}
          >
            Logout
          </button>
        </header>
        {children}
      </main>
    </div>
  );
}
