import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ShoppingCart, GraduationCap, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ReactNode } from 'react';

interface Course {
    id: number;
    title: string;
    description: string;
}

interface Purchase {
    id: number;
    amount: string;
    currency: string;
    status: string;
    payment_type: string;
    purchased_at: string;
    course: Course;
}

interface Props {
    purchases: Purchase[];
}

export default function Purchases({ purchases }: Props) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle size={20} className="text-green-600" />;
            case 'pending':
                return <Clock size={20} className="text-yellow-600" />;
            case 'failed':
                return <XCircle size={20} className="text-red-600" />;
            default:
                return <Clock size={20} className="text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600';
            case 'pending':
                return 'text-yellow-600';
            case 'failed':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <>
            <Head title="My Purchases" />

            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold" style={{ color: '#2d2d2d' }}>My Purchases</h1>
                    <p className="mt-2" style={{ color: '#7a7a7a' }}>View your course purchase history</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {purchases.map((purchase) => (
                        <div key={purchase.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <GraduationCap size={24} style={{ color: '#658965' }} />
                                        <h2 className="text-xl font-bold" style={{ color: '#2d2d2d' }}>
                                            {purchase.course.title}
                                        </h2>
                                    </div>

                                    {purchase.course.description && (
                                        <p className="mb-4" style={{ color: '#7a7a7a' }}>
                                            {purchase.course.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-6 text-sm">
                                        <div>
                                            <span style={{ color: '#7a7a7a' }}>Amount: </span>
                                            <span className="font-medium" style={{ color: '#2d2d2d' }}>
                                                ${purchase.amount} {purchase.currency.toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <span style={{ color: '#7a7a7a' }}>Type: </span>
                                            <span className="font-medium" style={{ color: '#2d2d2d' }}>
                                                {purchase.payment_type === 'one_time' ? 'One-time' : 'Subscription'}
                                            </span>
                                        </div>
                                        {purchase.purchased_at && (
                                            <div>
                                                <span style={{ color: '#7a7a7a' }}>Date: </span>
                                                <span className="font-medium" style={{ color: '#2d2d2d' }}>
                                                    {new Date(purchase.purchased_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(purchase.status)}
                                        <span className={`font-medium capitalize ${getStatusColor(purchase.status)}`}>
                                            {purchase.status}
                                        </span>
                                    </div>

                                    {purchase.status === 'completed' && (
                                        <Link
                                            href={`/courses/${purchase.course.id}`}
                                            className="text-sm font-medium hover:underline"
                                            style={{ color: '#658965' }}
                                        >
                                            View Course →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {purchases.length === 0 && (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" style={{ color: '#7a7a7a' }} />
                            <h2 className="text-xl font-bold mb-2" style={{ color: '#2d2d2d' }}>No purchases yet</h2>
                            <p className="mb-4" style={{ color: '#7a7a7a' }}>You haven't purchased any courses yet.</p>
                            <Link
                                href={route('courses.index')}
                                className="inline-block px-6 py-3 text-white rounded-xl font-medium"
                                style={{ backgroundColor: '#658965' }}
                            >
                                Browse Courses
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Purchases.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;
