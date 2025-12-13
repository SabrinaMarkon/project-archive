import { Head, Link } from "@inertiajs/react";
import { useState } from 'react';
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import ContactSection from '@/Components/Portfolio/ContactSection';
import { ArrowLeft, Lock, Unlock, Clock, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    description?: string | null;
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
    const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());

    const toggleModule = (moduleId: number) => {
        setExpandedModules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(moduleId)) {
                newSet.delete(moduleId);
            } else {
                newSet.add(moduleId);
            }
            return newSet;
        });
    };

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
                            {course.modules.map((module, index) => {
                                const isExpanded = expandedModules.has(module.id);
                                const modulePreview = module.post.excerpt || module.post.description?.substring(0, 200) || 'No preview available';

                                return (
                                    <div
                                        key={module.id}
                                        className="bg-white rounded-lg shadow-md overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between p-4">
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className="text-lg font-semibold" style={{ color: '#7a7a7a' }}>
                                                    {index + 1}.
                                                </span>
                                                <div className="flex-1">
                                                    {module.is_free ? (
                                                        <Link
                                                            href={`/posts/${module.post.slug}`}
                                                            className="text-lg font-medium hover:underline"
                                                            style={{ color: '#2d2d2d' }}
                                                        >
                                                            {module.post.title}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-lg font-medium" style={{ color: '#2d2d2d' }}>
                                                            {module.post.title}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 rounded text-sm font-medium" style={
                                                    module.is_free
                                                        ? { backgroundColor: '#e8f5e9', color: '#2e7d32' }
                                                        : { backgroundColor: '#fff3e0', color: '#e65100' }
                                                }>
                                                    {module.is_free ? (
                                                        <>
                                                            <Unlock size={14} className="inline mr-1" />
                                                            Free
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock size={14} className="inline mr-1" />
                                                            Locked
                                                        </>
                                                    )}
                                                </span>
                                                <button
                                                    onClick={() => toggleModule(module.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp size={20} style={{ color: '#658965' }} />
                                                    ) : (
                                                        <ChevronDown size={20} style={{ color: '#658965' }} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: '#e5e3df' }}>
                                                <h4 className="text-sm font-semibold mb-2" style={{ color: '#658965' }}>
                                                    What you'll learn:
                                                </h4>
                                                <p className="text-sm leading-relaxed" style={{ color: '#5a5a5a' }}>
                                                    {modulePreview}
                                                </p>
                                                {module.is_free && (
                                                    <Link
                                                        href={`/posts/${module.post.slug}`}
                                                        className="inline-block mt-3 text-sm font-semibold hover:underline"
                                                        style={{ color: '#658965' }}
                                                    >
                                                        Read this free module →
                                                    </Link>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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
