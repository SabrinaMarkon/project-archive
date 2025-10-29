import { Sparkles, Code2, BookOpen } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function HeroSection() {
    return (
        <section id="home" className="pt-32 pb-24 px-6 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles style={{ color: '#7a9d7a' }} size={24} />
                    <span className="font-semibold" style={{ color: '#658965' }}>Welcome to my portfolio</span>
                </div>
                <div className="max-w-4xl">
                    <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: '#2d2d2d' }}>
                        Developer & <span style={{ color: '#7a9d7a' }}>Writer</span>
                    </h1>
                    <p className="text-xl mb-8 leading-relaxed max-w-2xl" style={{ color: '#5a5a5a' }}>
                        I build elegant web applications with Laravel and React, and share my journey
                        through writing about technology, development practices, and the craft of creating software.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/projects" className="px-8 py-4 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 font-semibold" style={{ backgroundColor: '#7a9d7a' }}>
                            <Code2 size={20} />
                            View Projects
                        </Link>
                        <a href="/posts" className="px-8 py-4 bg-white rounded-xl transition-all duration-300 flex items-center gap-2 font-semibold shadow-sm hover:shadow-md" style={{ border: '2px solid #7a9d7a', color: '#658965' }}>
                            <BookOpen size={20} />
                            Read Writing
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
