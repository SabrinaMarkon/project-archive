import React from 'react';
import { Code2, ExternalLink } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Project {
    slug: string;
    title: string;
    description: string | null;
    tags?: string[];
}

interface FeaturedProjectsProps {
    projects: Project[];
    limit?: number;
}

export default function FeaturedProjects({ projects, limit = 3 }: FeaturedProjectsProps) {
    const displayProjects = projects.slice(0, limit);

    return (
        <section id="projects" className="py-24 px-6" style={{ backgroundColor: '#d4e5c8' }}>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-bold mb-4" style={{ color: '#2d2d2d' }}>Featured Projects</h2>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: '#4a4a4a' }}>
                        A selection of work I've built and contributed to, showcasing my skills in full-stack development.
                    </p>
                </div>

                <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    {displayProjects.map((project) => (
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
                            {project.tags && project.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {project.tags.map((tag, j) => (
                                        <span key={j} className="px-3 py-1 text-sm rounded-full font-medium" style={{ backgroundColor: '#e8ede8', color: '#658965' }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <Link href={`/projects/${project.slug}`} className="font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: '#658965' }}>
                                View Project <ExternalLink size={16} />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
