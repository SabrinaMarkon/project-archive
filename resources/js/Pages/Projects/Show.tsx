import { Head, Link } from '@inertiajs/react';
import { Project } from '@/types/project';
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import ContactSection from '@/Components/Portfolio/ContactSection';
import { ArrowLeft, Code2 } from 'lucide-react';

export default function Show({ project }: { project: Project }) {
    return (
        <PortfolioLayout>
            <Head title={`${project.title} - Sabrina Markon`} />

            {/* Project Header */}
            <section className="pt-32 pb-12 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 mb-6 font-medium transition hover:opacity-70"
                        style={{ color: '#658965' }}
                    >
                        <ArrowLeft size={20} />
                        Back to All Projects
                    </Link>

                    <div className="flex items-start gap-4 mb-6">
                        <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#7a9d7a' }}>
                            <Code2 className="text-white" size={24} aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                            <h1 className="font-bold leading-tight text-2xl sm:text-3xl md:text-4xl" style={{ color: '#2d2d2d' }}>
                                {project.title}
                            </h1>
                            {project.readTime && (
                                <p className="text-sm mt-2" style={{ color: '#7a7a7a' }}>
                                    {project.readTime}
                                </p>
                            )}
                        </div>
                    </div>

                    {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-4 py-1.5 rounded-full text-sm font-medium"
                                    style={{ backgroundColor: '#e8f0e8', color: '#5a7a5a' }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Project Content */}
            <section className="py-12 pb-24 px-6" style={{ backgroundColor: '#d4e5c8' }}>
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg" style={{ borderColor: '#c0d8b4', borderWidth: '1px' }}>
                        {project.excerpt && (
                            <div className="mb-6 pb-6 border-b" style={{ borderColor: '#e5e3df' }}>
                                <p className="text-xl italic" style={{ color: '#7a7a7a' }}>
                                    {project.excerpt}
                                </p>
                            </div>
                        )}
                        <h2 className="text-2xl font-bold mb-6" style={{ color: '#2d2d2d' }}>
                            About This Project
                        </h2>
                        <div className="prose prose-lg max-w-none" style={{ color: '#5a5a5a' }}>
                            {project.description ? (
                                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                                    {project.description}
                                </p>
                            ) : (
                                <p className="text-lg leading-relaxed italic">
                                    No description available for this project yet.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <ContactSection />
        </PortfolioLayout>
    );
}
