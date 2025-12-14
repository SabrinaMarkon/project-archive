import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { BookOpen, Lock, Unlock } from 'lucide-react';
import { ReactNode } from 'react';

interface Course {
    id: number;
    title: string;
    description: string | null;
    price: number;
    modules_count: number;
}

interface Purchase {
    id: number;
    course: Course;
    purchased_at: string;
}

interface Props {
    purchases: Purchase[];
}

export default function Courses({ purchases }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    My Courses
                </h2>
            }
        >
            <Head title="My Courses" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {purchases.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {purchases.map((purchase) => (
                                <div
                                    key={purchase.id}
                                    className="overflow-hidden bg-white shadow-sm sm:rounded-lg"
                                >
                                    <div className="p-6">
                                        <div className="mb-4 flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <BookOpen
                                                    className="text-green-600"
                                                    size={24}
                                                />
                                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                                                    <Unlock size={12} className="inline mr-1" />
                                                    Purchased
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                            {purchase.course.title}
                                        </h3>

                                        <p className="mb-4 text-sm text-gray-600">
                                            {purchase.course.description}
                                        </p>

                                        <div className="mb-4 text-xs text-gray-500">
                                            {purchase.course.modules_count} modules •
                                            Purchased{' '}
                                            {new Date(purchase.purchased_at).toLocaleDateString()}
                                        </div>

                                        <Link
                                            href={`/courses/${purchase.course.id}`}
                                            className="inline-block rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                                        >
                                            Continue Learning
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-center">
                                <Lock className="mx-auto mb-4 text-gray-400" size={48} />
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                    No Courses Yet
                                </h3>
                                <p className="mb-4 text-gray-600">
                                    You haven't purchased any courses. Browse our catalog to get
                                    started!
                                </p>
                                <Link
                                    href="/courses"
                                    className="inline-block rounded-md bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
                                >
                                    Browse Courses
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

Courses.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;
