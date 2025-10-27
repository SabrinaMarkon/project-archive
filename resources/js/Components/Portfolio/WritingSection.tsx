import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Writing {
    title: string;
    excerpt: string;
    date: string;
    readTime: string;
    link?: string;
}

const defaultWritings: Writing[] = [
    {
        title: "Building Scalable Web Applications",
        excerpt: "Thoughts on architecture patterns and best practices for modern web development...",
        date: "March 15, 2024",
        readTime: "5 min read"
    },
    {
        title: "The Art of Clean Code",
        excerpt: "Why writing maintainable code matters more than clever solutions...",
        date: "March 8, 2024",
        readTime: "7 min read"
    },
    {
        title: "React Performance Optimization",
        excerpt: "Practical tips for keeping your React applications fast and responsive...",
        date: "February 28, 2024",
        readTime: "6 min read"
    }
];

interface WritingSectionProps {
    writings?: Writing[];
}

export default function WritingSection({ writings = defaultWritings }: WritingSectionProps) {
    return (
        <section id="writing" className="py-24 px-6" style={{ backgroundColor: '#d8e5b8' }}>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-bold mb-4" style={{ color: '#2d2d2d' }}>Latest Writing</h2>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: '#4a4a4a' }}>
                        Thoughts on development, technology, and building for the web.
                    </p>
                </div>

                <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    {writings.map((post, i) => (
                        <article key={i} className="bg-white rounded-2xl p-6 border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group" style={{ borderColor: '#c8d8a8' }}>
                            <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: '#e8ede8', color: '#658965' }}>
                                {post.readTime}
                            </div>
                            <h3 className="text-xl font-bold mb-3 transition" style={{ color: '#2d2d2d' }}>
                                {post.title}
                            </h3>
                            <p className="mb-4 leading-relaxed" style={{ color: '#5a5a5a' }}>
                                {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between text-sm mb-4" style={{ color: '#7a7a7a' }}>
                                <span>{post.date}</span>
                            </div>
                            <a href={post.link || "#"} className="font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: '#658965' }}>
                                Read More <ChevronRight size={16} />
                            </a>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
