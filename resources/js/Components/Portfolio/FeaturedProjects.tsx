import { Project } from '@/types/project';
import ContentCard from '@/Components/ContentCard';

interface FeaturedProjectsProps {
    projects: Project[];
    limit?: number;
}

export default function FeaturedProjects({ projects = [], limit = 3 }: FeaturedProjectsProps) {
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
                        <ContentCard
                            key={project.slug}
                            title={project.title}
                            slug={project.slug}
                            description={project.description}
                            href={`/projects/${project.slug}`}
                            linkText="View Project"
                            tags={project.tags}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
