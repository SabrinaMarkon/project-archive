import { Link } from '@inertiajs/react';
import { Code2, ExternalLink } from 'lucide-react';

interface ContentCardProps {
    title: string;
    slug: string;
    description: string | null;
    href: string;
    linkText?: string;
    tags?: string[];
    readTime?: string;
}

export default function ContentCard({
    title,
    slug,
    description,
    href,
    linkText = 'View',
    tags,
    readTime,
}: ContentCardProps) {
    return (
        <div
            key={slug}
            className="group bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ borderColor: '#c0d8b4' }}
        >
            <div
                className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                style={{ backgroundColor: '#7a9d7a' }}
            >
                <Code2 className="text-white" size={24} />
            </div>

            <h3 className="text-xl font-bold mb-3" style={{ color: '#2d2d2d' }}>
                {title}
            </h3>

            {readTime && (
                <div
                    className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3"
                    style={{ backgroundColor: '#e8ede8', color: '#658965' }}
                >
                    {readTime}
                </div>
            )}

            <p className="mb-4 leading-relaxed" style={{ color: '#5a5a5a' }}>
                {description || 'No description available.'}
            </p>

            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 text-sm rounded-full font-medium"
                            style={{ backgroundColor: '#e8ede8', color: '#658965' }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            <Link
                href={href}
                className="font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                style={{ color: '#658965' }}
            >
                {linkText} <ExternalLink size={16} />
            </Link>
        </div>
    );
}
