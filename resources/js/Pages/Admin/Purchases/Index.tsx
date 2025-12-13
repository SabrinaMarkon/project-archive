import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ShoppingCart, User, GraduationCap } from 'lucide-react';
import { ReactNode } from 'react';

interface Course {
    id: number;
    title: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Purchase {
    id: number;
    amount: string;
    currency: string;
    status: string;
    payment_type: string;
    purchased_at: string;
    stripe_payment_intent_id: string | null;
    stripe_subscription_id: string | null;
    user: User;
    course: Course;
}

interface Props {
    purchases: Purchase[];
}

export default function Index({ purchases }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600';
            case 'pending':
                return 'text-yellow-600';
            case 'failed':
                return 'text-red-600';
            case 'refunded':
                return 'text-gray-600';
            default:
                return 'text-gray-600';
        }
    };

    const getPaymentTypeLabel = (type: string) => {
        return type === 'one_time' ? 'One-time' : 'Subscription';
    };

    return (
        <>
            <Head title="Purchase Management" />

            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold" style={{ color: '#2d2d2d' }}>Purchase Management</h1>
                    <p className="mt-2" style={{ color: '#7a7a7a' }}>View and manage all course purchases</p>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <table className="w-full">
                        <thead style={{ backgroundColor: '#f5f5f5' }}>
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#2d2d2d' }}>User</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#2d2d2d' }}>Course</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#2d2d2d' }}>Amount</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#2d2d2d' }}>Type</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#2d2d2d' }}>Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#2d2d2d' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map((purchase) => (
                                <tr key={purchase.id} className="border-t">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <User size={16} style={{ color: '#658965' }} />
                                            <div>
                                                <div className="font-medium" style={{ color: '#2d2d2d' }}>{purchase.user.name}</div>
                                                <div className="text-sm" style={{ color: '#7a7a7a' }}>{purchase.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap size={16} style={{ color: '#658965' }} />
                                            <span style={{ color: '#2d2d2d' }}>{purchase.course.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4" style={{ color: '#5a5a5a' }}>
                                        ${purchase.amount} {purchase.currency.toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4" style={{ color: '#5a5a5a' }}>
                                        {getPaymentTypeLabel(purchase.payment_type)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-medium capitalize ${getStatusColor(purchase.status)}`}>
                                            {purchase.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4" style={{ color: '#5a5a5a' }}>
                                        {purchase.purchased_at ? new Date(purchase.purchased_at).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {purchases.length === 0 && (
                        <div className="px-6 py-12 text-center" style={{ color: '#7a7a7a' }}>
                            <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No purchases found.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Index.layout = (page: ReactNode) => <DashboardLayout children={page} />;
