import { PropsWithChildren } from 'react';
import { Link, router,usePage } from '@inertiajs/react';

export default function DashboardLayout({ children }: PropsWithChildren) {
  const { auth } = usePage().props as any;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-4">
        <h2 className="text-xl font-bold mb-4">Project Archive</h2>
        <nav className="flex flex-col space-y-2">
          <Link href="/dashboard" className="hover:text-blue-300">Dashboard</Link>
          <Link href="/admin/projects/create" className="hover:text-blue-300">Create Project</Link>
          <Link href="/admin/projects" className="hover:text-blue-300">Project List</Link>
          <button onClick={() => router.post(route('logout'))} className="text-left hover:text-red-400">
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Admin Area</h1>
          <button onClick={() => router.post(route('logout'))} className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            Logout
          </button>
        </header>
        {children}
      </main>
    </div>
  );
}
