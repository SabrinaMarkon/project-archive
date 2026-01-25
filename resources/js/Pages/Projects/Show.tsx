import { Head, Link } from '@inertiajs/react';
import { Project } from '@/types/project';
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import ContactSection from '@/Components/Portfolio/ContactSection';
import DescriptionRenderer from '@/Components/DescriptionRenderer';
import { ArrowLeft, Code2 } from 'lucide-react';

export default function Show({ project }: { project: Project }) {
    const metaTitle = project.metaTitle || `${project.title} - Sabrina Markon`;
    const metaDescription = project.metaDescription || project.excerpt || `View the ${project.title} project by Sabrina Markon`;

    return (
        <PortfolioLayout>
            <Head title={metaTitle}>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={metaTitle} />
                <meta property="og:description" content={metaDescription} />
                {project.coverImage && (
                    <meta property="og:image" content={project.coverImage} />
                )}
            </Head>

            {/* Project Header */}
            <section className="pt-32 pb-12 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href={route('projects.index')}
                        className="inline-flex items-center gap-2 mb-6 font-medium transition hover:opacity-70"
                        style={{ color: '#658965' }}
                    >
                        <ArrowLeft size={20} />
                        Back to All Projects
                    </Link>

                    {project.coverImage && (
                        <div className="mb-8 rounded-xl overflow-hidden" style={{ borderColor: '#c0d8b4', borderWidth: '1px' }}>
                            <img
                                src={project.coverImage}
                                alt={project.title}
                                className="w-full h-auto object-cover max-h-96"
                            />
                        </div>
                    )}

                    <div className="flex items-start gap-4 mb-6">
                        <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#7a9d7a' }}>
                            <Code2 className="text-white" size={24} aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                            <h1 className="font-bold leading-tight text-2xl sm:text-3xl md:text-4xl" style={{ color: '#2d2d2d' }}>
                                {project.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm" style={{ color: '#7a7a7a' }}>
                                {project.authorName && (
                                    <span>By {project.authorName}</span>
                                )}
                                {project.publishedAt && (
                                    <>
                                        {project.authorName && <span>•</span>}
                                        <span>
                                            {new Date(project.publishedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </>
                                )}
                                {project.readTime && (
                                    <>
                                        {(project.authorName || project.publishedAt) && <span>•</span>}
                                        <span>{project.readTime}</span>
                                    </>
                                )}
                                {project.viewCount !== undefined && project.viewCount > 0 && (
                                    <>
                                        {(project.authorName || project.publishedAt || project.readTime) && <span>•</span>}
                                        <span>{project.viewCount.toLocaleString()} {project.viewCount === 1 ? 'view' : 'views'}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag) => (
                                <Link
                                    key={tag}
                                    href={`/projects?tag=${encodeURIComponent(tag)}`}
                                    className="px-4 py-1.5 rounded-full text-sm font-medium transition hover:opacity-80"
                                    style={{ backgroundColor: '#e8f0e8', color: '#5a7a5a' }}
                                >
                                    {tag}
                                </Link>
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
                        <DescriptionRenderer
                            content={project.description || ''}
                            format={project.format}
                        />
                    </div>
                </div>
            </section>

            <ContactSection />
        </PortfolioLayout>
    );
}
