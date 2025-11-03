import { Head, Link } from '@inertiajs/react';
import { Post } from '@/types/post';
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import ContactSection from '@/Components/Portfolio/ContactSection';
import DescriptionRenderer from '@/Components/DescriptionRenderer';
import { ArrowLeft, Code2 } from 'lucide-react';

export default function Show({ post }: { post: Post }) {
    return (
        <PortfolioLayout>
            <Head title={`${post.title} - Sabrina Markon`} />

            {/* Post Header */}
            <section className="pt-32 pb-12 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/posts"
                        className="inline-flex items-center gap-2 mb-6 font-medium transition hover:opacity-70"
                        style={{ color: '#658965' }}
                    >
                        <ArrowLeft size={20} />
                        Back to All Writing
                    </Link>

                    <div className="flex items-start gap-4 mb-6">
                        <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#7a9d7a' }}>
                            <Code2 className="text-white" size={24} aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                            <h1 className="font-bold leading-tight text-2xl sm:text-3xl md:text-4xl" style={{ color: '#2d2d2d' }}>
                                {post.title}
                            </h1>
                            {post.readTime && (
                                <p className="text-sm mt-2" style={{ color: '#7a7a7a' }}>
                                    {post.readTime}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Post Content */}
            <section className="py-12 pb-24 px-6" style={{ backgroundColor: '#d4e5c8' }}>
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg" style={{ borderColor: '#c0d8b4', borderWidth: '1px' }}>
                        {post.excerpt && (
                            <div className="mb-6 pb-6 border-b" style={{ borderColor: '#e5e3df' }}>
                                <p className="text-xl italic" style={{ color: '#7a7a7a' }}>
                                    {post.excerpt}
                                </p>
                            </div>
                        )}
                        <DescriptionRenderer
                            content={post.description || ''}
                            format={post.format}
                        />
                    </div>
                </div>
            </section>

            <ContactSection />
        </PortfolioLayout>
    );
}
