import React from "react";
import { Head, Link } from "@inertiajs/react";
import { Post } from "@/types/post";
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import ContactSection from '@/Components/Portfolio/ContactSection';
import { Code2, ExternalLink } from 'lucide-react';

export default function Index({ posts }: { posts: Post[] }) {
    return (
        <PortfolioLayout>
            <Head title="Posts - Sabrina Markon" />

            {/* Posts Header */}
            <section className="pt-32 pb-12 px-6 bg-white">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#2d2d2d' }}>
                        All Posts
                    </h1>
                    <p className="text-xl max-w-2xl mx-auto" style={{ color: '#5a5a5a' }}>
                        Tutorials, lessons learned, and deep dives into the tools and techniques behind my full-stack development journey!
                    </p>
                </div>
            </section>

            {/* Posts Grid */}
            <section className="py-12 pb-24 px-6" style={{ backgroundColor: '#d4e5c8' }}>
                <div className="max-w-6xl mx-auto">
                    <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        {posts.map((post) => (
                            <div key={post.slug} className="group bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{ borderColor: '#c0d8b4' }}>
                                <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: '#7a9d7a' }}>
                                    <Code2 className="text-white" size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-3" style={{ color: '#2d2d2d' }}>
                                    {post.title}
                                </h3>
                                <p className="mb-4 leading-relaxed" style={{ color: '#5a5a5a' }}>
                                    {post.description || 'No description available.'}
                                </p>
                                <Link href={`/posts/${post.slug}`} className="font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: '#658965' }}>
                                    View Post <ExternalLink size={16} />
                                </Link>
                            </div>
                        ))}
                    </div>

                    {posts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-xl" style={{ color: '#5a5a5a' }}>No posts available yet.</p>
                        </div>
                    )}
                </div>
            </section>

            <ContactSection />
        </PortfolioLayout>
    );
}
