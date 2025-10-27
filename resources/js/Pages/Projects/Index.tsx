import React from "react";
import { Head, Link } from "@inertiajs/react";
import { Project } from "@/types/project";
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import ContactSection from '@/Components/Portfolio/ContactSection';
import { Code2, ExternalLink } from 'lucide-react';

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
                            <div key={project.slug} className="group bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{ borderColor: '#c0d8b4' }}>
                                <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: '#7a9d7a' }}>
                                    <Code2 className="text-white" size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-3" style={{ color: '#2d2d2d' }}>
                                    {project.title}
                                </h3>
                                <p className="mb-4 leading-relaxed" style={{ color: '#5a5a5a' }}>
                                    {project.description || 'No description available.'}
                                </p>
                                <Link href={`/projects/${project.slug}`} className="font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: '#658965' }}>
                                    View Project <ExternalLink size={16} />
                                </Link>
                            </div>
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
