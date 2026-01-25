import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import { ReactNode, FormEventHandler, useState } from 'react';
import { GraduationCap, ShoppingCart, Trash2, Plus } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    is_admin: boolean;
    created_at: string;
}

interface Course {
    id: number;
    title: string;
}

interface Enrollment {
    id: number;
    enrolled_at: string;
    course: Course;
}

interface Purchase {
    id: number;
    amount: string;
    status: string;
    purchased_at: string;
    course: Course;
}

interface Props {
    user: User;
    enrollments: Enrollment[];
    purchases: Purchase[];
    availableCourses: Course[];
}

export default function Show({ user, enrollments, purchases, availableCourses }: Props) {
    const [selectedCourse, setSelectedCourse] = useState('');

    const enrollForm = useForm({
        course_id: '',
    });

    const handleEnroll: FormEventHandler = (e) => {
        e.preventDefault();
        enrollForm.post(`/admin/users/${user.id}/enrollments`, {
            preserveScroll: true,
            onSuccess: () => setSelectedCourse(''),
        });
    };

    const removeEnrollment = (enrollmentId: number) => {
        if (confirm('Remove this enrollment?')) {
            router.delete(`/admin/users/${user.id}/enrollments/${enrollmentId}`, {
                preserveScroll: true,
            });
        }
    };

    const deleteUser = () => {
        if (confirm(`Delete user ${user.name}? This cannot be undone.`)) {
            router.delete(`/admin/users/${user.id}`);
        }
    };

    return (
        <>
            <Head title={`${user.name} - User Management`} />

            <div className="p-6">
                <div className="mb-6">
                    <Link href={route('admin.users.index')} className="text-sm font-medium hover:underline mb-2 inline-block" style={{ color: '#658965' }}>
                        ← Back to Users
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: '#2d2d2d' }}>{user.name}</h1>
                            <p className="mt-1" style={{ color: '#7a7a7a' }}>{user.email}</p>
                            <div className="mt-3 flex gap-2">
                                {!user.email_verified_at && (
                                    <button
                                        type="button"
                                        onClick={() => router.post(`/admin/users/${user.id}/resend-verification`)}
                                        className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
                                        style={{ borderColor: '#658965', color: '#658965' }}
                                    >
                                        Resend Verification Email
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => router.post(`/admin/users/${user.id}/resend-password-reset`)}
                                    className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
                                    style={{ borderColor: '#658965', color: '#658965' }}
                                >
                                    Send Password Reset
                                </button>
                            </div>
                        </div>
                        <DangerButton onClick={deleteUser}>
                            <Trash2 size={16} className="mr-2" />
                            Delete User
                        </DangerButton>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Enrollments */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#2d2d2d' }}>
                                <GraduationCap size={24} style={{ color: '#658965' }} />
                                Course Enrollments ({enrollments.length})
                            </h2>
                        </div>

                        {availableCourses.length > 0 && (
                            <form onSubmit={handleEnroll} className="mb-4">
                                <div className="flex gap-2">
                                    <select
                                        value={enrollForm.data.course_id}
                                        onChange={(e) => enrollForm.setData('course_id', e.target.value)}
                                        className="flex-1 rounded border-gray-300"
                                        required
                                    >
                                        <option value="">Select a course...</option>
                                        {availableCourses.map((course) => (
                                            <option key={course.id} value={course.id}>{course.title}</option>
                                        ))}
                                    </select>
                                    <PrimaryButton disabled={enrollForm.processing}>
                                        <Plus size={16} />
                                    </PrimaryButton>
                                </div>
                            </form>
                        )}

                        <div className="space-y-2">
                            {enrollments.map((enrollment) => (
                                <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded">
                                    <div>
                                        <div className="font-medium" style={{ color: '#2d2d2d' }}>{enrollment.course.title}</div>
                                        <div className="text-sm" style={{ color: '#7a7a7a' }}>
                                            Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeEnrollment(enrollment.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {enrollments.length === 0 && (
                                <p className="text-center py-4" style={{ color: '#7a7a7a' }}>No enrollments yet</p>
                            )}
                        </div>
                    </div>

                    {/* Purchases */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#2d2d2d' }}>
                            <ShoppingCart size={24} style={{ color: '#658965' }} />
                            Purchase History ({purchases.length})
                        </h2>

                        <div className="space-y-2">
                            {purchases.map((purchase) => (
                                <div key={purchase.id} className="p-3 border rounded">
                                    <div className="font-medium" style={{ color: '#2d2d2d' }}>{purchase.course.title}</div>
                                    <div className="text-sm flex justify-between mt-1">
                                        <span style={{ color: '#7a7a7a' }}>${purchase.amount}</span>
                                        <span className={`font-medium ${purchase.status === 'completed' ? 'text-green-600' : 'text-gray-600'}`}>
                                            {purchase.status}
                                        </span>
                                    </div>
                                    {purchase.purchased_at && (
                                        <div className="text-xs mt-1" style={{ color: '#7a7a7a' }}>
                                            {new Date(purchase.purchased_at).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {purchases.length === 0 && (
                                <p className="text-center py-4" style={{ color: '#7a7a7a' }}>No purchases yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = (page: ReactNode) => <DashboardLayout children={page} />;
