import { Head } from "@inertiajs/react";
import { Project } from "@/types/project";
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import ContactSection from '@/Components/Portfolio/ContactSection';
import ContentCard from '@/Components/ContentCard';

export default function Index({ projects }: { projects: Project[] }) {
    return (
        <PortfolioLayout>
            <Head title="Projects - Sabrina Markon" />

            {/* Projects Header */}
            <section className="pt-32 pb-12 px-6 bg-white">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#2d2d2d' }}>
                        All Projects
                    </h1>
                    <p className="text-xl max-w-2xl mx-auto" style={{ color: '#5a5a5a' }}>
                        A comprehensive collection of my work showcasing full-stack development with Laravel, React, and more.
                    </p>
                </div>
            </section>

            {/* Projects Grid */}
            <section className="py-12 pb-24 px-6" style={{ backgroundColor: '#d4e5c8' }}>
                <div className="max-w-6xl mx-auto">
                    <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        {projects.map((project) => (
                            <ContentCard
                                key={project.slug}
                                title={project.title}
                                slug={project.slug}
                                description={project.excerpt || project.description}
                                format="plaintext"
                                href={`/projects/${project.slug}`}
                                linkText="View Project"
                                tags={project.tags}
                            />
                        ))}
                    </div>

                    {projects.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-xl" style={{ color: '#5a5a5a' }}>No projects available yet.</p>
                        </div>
                    )}
                </div>
            </section>

            <ContactSection />
        </PortfolioLayout>
    );
}
