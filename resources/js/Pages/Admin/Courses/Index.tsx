import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DangerButton from "@/Components/DangerButton";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import { Head, Link, router } from "@inertiajs/react";
import { Edit, Trash2, ChevronDown, ChevronRight, Book } from "lucide-react";

interface Course {
    id: number;
    title: string;
    description: string | null;
    price: string;
    payment_type: 'one_time' | 'monthly' | 'annual';
    stripe_enabled: boolean;
    paypal_enabled: boolean;
    modules_count: number;
}

Index.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default function Index({ courses }: { courses: Course[] }) {
    const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

    const toggleExpand = (courseId: number) => {
        setExpandedCourseId(expandedCourseId === courseId ? null : courseId);
    };

    const confirmDeletion = (course: Course) => {
        setCourseToDelete(course);
        setConfirmingDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
        setCourseToDelete(null);
    };

    const deleteCourse = () => {
        if (courseToDelete) {
            router.delete(`/admin/courses/${courseToDelete.id}`, {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const formatPaymentType = (type: string) => {
        switch (type) {
            case 'one_time':
                return 'One-time';
            case 'monthly':
                return 'Monthly';
            case 'annual':
                return 'Annual';
            default:
                return type;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight" style={{ color: '#3d3d3d' }}>
                        Courses
                    </h2>
                    <Link
                        href="/admin/courses/create"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition hover:opacity-90"
                        style={{ backgroundColor: '#7a9d7a' }}
                    >
                        <Book size={16} />
                        Create Course
                    </Link>
                </div>
            }
        >
            <Head title="Courses" />

            <div className="py-4 px-6 text-gray-900 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                <div className="space-y-2">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            style={{ borderColor: '#e5e3df' }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <button
                                        onClick={() => toggleExpand(course.id)}
                                        className="flex items-center gap-2 text-left font-medium hover:opacity-70 transition"
                                        style={{ color: '#3d3d3d' }}
                                    >
                                        {expandedCourseId === course.id ? (
                                            <ChevronDown size={20} style={{ color: '#7a9d7a' }} />
                                        ) : (
                                            <ChevronRight size={20} style={{ color: '#7a9d7a' }} />
                                        )}
                                        <span>{course.title}</span>
                                    </button>

                                    <div className="flex items-center gap-2 text-sm" style={{ color: '#7a7a7a' }}>
                                        <span className="px-2 py-1 rounded" style={{ backgroundColor: '#f0f0f0' }}>
                                            ${course.price}
                                        </span>
                                        <span className="px-2 py-1 rounded" style={{ backgroundColor: '#e8f0e8', color: '#5a7a5a' }}>
                                            {course.modules_count} {course.modules_count === 1 ? 'module' : 'modules'}
                                        </span>
                                        {course.stripe_enabled && (
                                            <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                                                Stripe
                                            </span>
                                        )}
                                        {course.paypal_enabled && (
                                            <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#fff3e0', color: '#f57c00' }}>
                                                PayPal
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/admin/courses/${course.id}`}
                                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white rounded-md transition hover:opacity-90"
                                        style={{ backgroundColor: '#5a8a5a' }}
                                        title="Edit course"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </Link>

                                    <button
                                        onClick={() => confirmDeletion(course)}
                                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md transition hover:bg-red-700"
                                        title="Delete course"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {expandedCourseId === course.id && (
                                <div
                                    className="mt-3 pt-3 border-t"
                                    style={{ borderColor: '#e5e3df' }}
                                >
                                    <div className="text-sm mb-2" style={{ color: '#5a5a5a' }}>
                                        {course.description || <em>No description available</em>}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs" style={{ color: '#7a7a7a' }}>
                                        <span>Payment: {formatPaymentType(course.payment_type)}</span>
                                        <span>Price: ${course.price}</span>
                                        <span>Modules: {course.modules_count}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {courses.length === 0 && (
                        <div className="text-center py-8" style={{ color: '#7a7a7a' }}>
                            <p>No courses found. Create your first course!</p>
                            <Link
                                href="/admin/courses/create"
                                className="inline-block mt-4 px-5 py-2.5 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                                style={{ backgroundColor: '#7a9d7a' }}
                            >
                                Create Course
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={confirmingDeletion} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium" style={{ color: '#3d3d3d' }}>
                        Are you sure you want to delete this course?
                    </h2>

                    <p className="mt-1 text-sm" style={{ color: '#7a7a7a' }}>
                        Once deleted, "{courseToDelete?.title}" will be permanently removed. This action cannot be undone.
                    </p>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton onClick={deleteCourse}>
                            Delete Course
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
