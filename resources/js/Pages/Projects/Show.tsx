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

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#7a9d7a' }}>
                            <Code2 className="text-white" size={32} />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold" style={{ color: '#2d2d2d' }}>
                            {project.title}
                        </h1>
                    </div>
                </div>
            </section>

            {/* Project Content */}
            <section className="py-12 pb-24 px-6" style={{ backgroundColor: '#d4e5c8' }}>
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg" style={{ borderColor: '#c0d8b4', borderWidth: '1px' }}>
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
