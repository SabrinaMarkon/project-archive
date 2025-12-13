import { Link } from '@inertiajs/react';
import { Code2, ExternalLink, Lock, Sparkles } from 'lucide-react';
import DescriptionRenderer from './DescriptionRenderer';

interface ContentCardProps {
    title: string;
    slug: string;
    description: string | null;
    format?: 'html' | 'markdown' | 'plaintext';
    href: string;
    linkText?: string;
    tags?: string[];
    readTime?: string;
    publishedAt?: string | null;
    coverImage?: string | null;
    isFeatured?: boolean;
    tagFilterPath?: string;
    isPremium?: boolean;
    premiumCourse?: {
        id: number;
        title: string;
        price: number;
    } | null;
}

export default function ContentCard({
    title,
    slug,
    description,
    format = 'plaintext',
    href,
    linkText = 'View',
    tags,
    readTime,
    publishedAt,
    coverImage,
    isFeatured,
    tagFilterPath,
    isPremium,
    premiumCourse,
}: ContentCardProps) {
    return (
        <div
            key={slug}
            className="group bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative"
            style={{ borderColor: isFeatured ? '#7a9d7a' : '#c0d8b4', borderWidth: isFeatured ? '2px' : '1px' }}
        >
            {coverImage && (
                <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                        src={coverImage}
                        alt={title}
                        className="w-full h-48 object-cover"
                    />
                </div>
            )}

            {!coverImage && (
                <div
                    className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                    style={{ backgroundColor: '#7a9d7a' }}
                >
                    <Code2 className="text-white" size={24} />
                </div>
            )}

            <div className="flex flex-wrap gap-2 mb-2">
                {isFeatured && (
                    <span
                        className="px-3 py-1 text-xs font-bold uppercase rounded-full"
                        style={{ backgroundColor: '#7a9d7a', color: '#ffffff' }}
                    >
                        Featured
                    </span>
                )}
                {isPremium && premiumCourse && (
                    <span
                        className="px-3 py-1 text-xs font-bold uppercase rounded-full flex items-center gap-1.5"
                        style={{
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            color: '#ffffff'
                        }}
                    >
                        <Lock size={12} />
                        Premium
                    </span>
                )}
            </div>

            <h3 className={`font-bold mb-3 ${title.length > 50 ? 'text-lg' : 'text-xl'}`} style={{ color: '#2d2d2d' }}>
                {title}
            </h3>

            {(readTime || publishedAt) && (
                <div className="flex flex-wrap items-center gap-2 mb-3 text-sm" style={{ color: '#7a7a7a' }}>
                    {publishedAt && (
                        <span>
                            {new Date(publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                    )}
                    {readTime && (
                        <>
                            {publishedAt && <span>•</span>}
                            <span>{readTime}</span>
                        </>
                    )}
                </div>
            )}

            <div className="mb-4 leading-relaxed prose prose-sm max-w-none" style={{ color: '#5a5a5a' }}>
                <DescriptionRenderer
                    content={description?.substring(0, 200) || ''}
                    format={format}
                    className="line-clamp-3"
                />
            </div>

            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag, index) => (
                        tagFilterPath ? (
                            <Link
                                key={index}
                                href={`${tagFilterPath}?tag=${encodeURIComponent(tag)}`}
                                className="px-3 py-1 text-sm rounded-full font-medium transition hover:opacity-80"
                                style={{ backgroundColor: '#e8ede8', color: '#658965' }}
                            >
                                {tag}
                            </Link>
                        ) : (
                            <span
                                key={index}
                                className="px-3 py-1 text-sm rounded-full font-medium"
                                style={{ backgroundColor: '#e8ede8', color: '#658965' }}
                            >
                                {tag}
                            </span>
                        )
                    ))}
                </div>
            )}

            {isPremium && premiumCourse && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#fef3c7', borderLeft: '3px solid #f59e0b' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#92400e' }}>
                        Exclusive Course Content
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#b45309' }}>
                        Unlock in <span className="font-bold">{premiumCourse.title}</span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#92400e' }}>
                        Only ${premiumCourse.price}
                    </p>
                </div>
            )}

            <Link
                href={href}
                className="font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                style={{ color: '#658965' }}
            >
                {isPremium ? (
                    <>
                        <Lock size={16} />
                        View Details
                    </>
                ) : (
                    <>
                        {linkText} <ExternalLink size={16} />
                    </>
                )}
            </Link>
        </div>
    );
}
