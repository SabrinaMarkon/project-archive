import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Users, ShieldCheck, ShoppingCart } from 'lucide-react';
import { ReactNode } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    enrollments_count: number;
    purchases_count: number;
    created_at: string;
}

interface Props {
    users: User[];
}

export default function Index({ users }: Props) {
    return (
        <>
            <Head title="User Management" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: '#2d2d2d' }}>User Management</h1>
                        <p className="mt-2" style={{ color: '#7a7a7a' }}>Manage users, enrollments, and permissions</p>
                    </div>
                    <Link
                        href="/admin/users/create"
                        className="px-4 py-2 rounded-lg text-white font-semibold hover:shadow-lg transition"
                        style={{ backgroundColor: '#658965' }}
                    >
                        Create User
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <table className="w-full">
                        <thead style={{ backgroundColor: '#f5f5f5' }}>
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#2d2d2d' }}>User</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#2d2d2d' }}>Email</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#2d2d2d' }}>Role</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#2d2d2d' }}>Enrollments</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#2d2d2d' }}>Purchases</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#2d2d2d' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-t">
                                    <td className="px-6 py-4">
                                        <div className="font-medium" style={{ color: '#2d2d2d' }}>{user.name}</div>
                                    </td>
                                    <td className="px-6 py-4" style={{ color: '#5a5a5a' }}>{user.email}</td>
                                    <td className="px-6 py-4">
                                        {user.is_admin ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                                                <ShieldCheck size={14} />
                                                Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#f5f5f5', color: '#7a7a7a' }}>
                                                <Users size={14} />
                                                User
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4" style={{ color: '#5a5a5a' }}>{user.enrollments_count}</td>
                                    <td className="px-6 py-4" style={{ color: '#5a5a5a' }}>{user.purchases_count}</td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/admin/users/${user.id}`}
                                            className="text-sm font-medium hover:underline"
                                            style={{ color: '#658965' }}
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && (
                        <div className="px-6 py-12 text-center" style={{ color: '#7a7a7a' }}>
                            No users found.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Index.layout = (page: ReactNode) => <DashboardLayout children={page} />;
