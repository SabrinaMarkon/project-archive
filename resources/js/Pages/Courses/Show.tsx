import { Head, Link } from "@inertiajs/react";
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import ContactSection from '@/Components/Portfolio/ContactSection';
import { ArrowLeft, Lock, Unlock, Clock, DollarSign } from 'lucide-react';

interface Post {
    id: number;
    title: string;
    slug: string;
}

interface CourseModule {
    id: number;
    post_id: number;
    is_free: boolean;
    order: number;
    post: Post;
}

interface Course {
    id: number;
    title: string;
    description: string | null;
    price: string;
    payment_type: 'one_time' | 'monthly' | 'annual';
    stripe_enabled: boolean;
    paypal_enabled: boolean;
    modules: CourseModule[];
}

export default function Show({ course }: { course: Course }) {
    const formatPaymentType = (type: string) => {
        switch (type) {
            case 'one_time':
                return 'One-time payment';
            case 'monthly':
                return 'Monthly subscription';
            case 'annual':
                return 'Annual subscription';
            default:
                return type;
        }
    };

    return (
        <PortfolioLayout>
            <Head title={`${course.title} - Sabrina Markon`} />

            {/* Course Header */}
            <section className="pt-32 pb-12 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 mb-6 text-sm font-medium hover:underline"
                        style={{ color: '#658965' }}
                    >
                        <ArrowLeft size={16} />
                        Back to Courses
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#2d2d2d' }}>
                        {course.title}
                    </h1>

                    <p className="text-xl mb-6" style={{ color: '#5a5a5a' }}>
                        {course.description}
                    </p>

                    <div className="flex items-center gap-6 mb-6">
                        <div className="flex items-center gap-2">
                            <DollarSign size={24} style={{ color: '#658965' }} />
                            <span className="text-3xl font-bold" style={{ color: '#2d2d2d' }}>
                                {course.price}
                            </span>
                            {course.payment_type !== 'one_time' && (
                                <span className="text-sm" style={{ color: '#7a7a7a' }}>
                                    / {course.payment_type === 'monthly' ? 'month' : 'year'}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock size={20} style={{ color: '#658965' }} />
                            <span style={{ color: '#5a5a5a' }}>{formatPaymentType(course.payment_type)}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 mb-6">
                        {course.stripe_enabled && (
                            <span className="px-3 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                                Stripe
                            </span>
                        )}
                        {course.paypal_enabled && (
                            <span className="px-3 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#fff3e0', color: '#f57c00' }}>
                                PayPal
                            </span>
                        )}
                    </div>

                    <button
                        className="px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
                        style={{ backgroundColor: '#658965' }}
                    >
                        Purchase Course
                    </button>
                </div>
            </section>

            {/* Course Modules */}
            <section className="py-12 pb-24 px-6" style={{ backgroundColor: '#d8e5b8' }}>
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-2" style={{ color: '#2d2d2d' }}>
                        Course Content
                    </h2>
                    <p className="text-lg mb-6" style={{ color: '#5a5a5a' }}>
                        {course.modules.length} {course.modules.length === 1 ? 'module' : 'modules'}
                    </p>

                    {course.modules.length > 0 ? (
                        <div className="space-y-3">
                            {course.modules.map((module, index) => (
                                <div
                                    key={module.id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden"
                                >
                                    {module.is_free ? (
                                        <Link
                                            href={`/posts/${module.post.slug}`}
                                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg font-semibold" style={{ color: '#7a7a7a' }}>
                                                    {index + 1}.
                                                </span>
                                                <span className="text-lg font-medium" style={{ color: '#2d2d2d' }}>
                                                    {module.post.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
                                                    <Unlock size={14} className="inline mr-1" />
                                                    Free
                                                </span>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="flex items-center justify-between p-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg font-semibold" style={{ color: '#7a7a7a' }}>
                                                    {index + 1}.
                                                </span>
                                                <span className="text-lg font-medium" style={{ color: '#2d2d2d' }}>
                                                    {module.post.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}>
                                                    <Lock size={14} className="inline mr-1" />
                                                    Locked
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg">
                            <p className="text-lg" style={{ color: '#7a7a7a' }}>
                                No modules available yet.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <ContactSection />
        </PortfolioLayout>
    );
}
