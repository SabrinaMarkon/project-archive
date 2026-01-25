import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DangerButton from "@/Components/DangerButton";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Modal";
import DescriptionRenderer from "@/Components/DescriptionRenderer";
import SecondaryButton from "@/Components/SecondaryButton";
import { Head, Link, router } from "@inertiajs/react";
import { Post } from "@/types/post";
import { ExternalLink, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";

Index.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default function Index({ posts }: { posts: Post[] }) {
    const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);

    const toggleExpand = (postId: number) => {
        setExpandedPostId(expandedPostId === postId ? null : postId);
    };

    const confirmDeletion = (post: Post) => {
        setPostToDelete(post);
        setConfirmingDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
        setPostToDelete(null);
    };

    const deletePost = () => {
        if (postToDelete) {
            router.delete(`/admin/posts/${postToDelete.slug}`, {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'published':
                return { bg: '#d4f0d4', color: '#2d5a2d' };
            case 'draft':
                return { bg: '#f0e8d4', color: '#5a4a2d' };
            case 'archived':
                return { bg: '#e8e8e8', color: '#5a5a5a' };
            default:
                return { bg: '#e8e8e8', color: '#5a5a5a' };
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight" style={{ color: '#3d3d3d' }}>
                    Writing List
                </h2>
            }
        >
            <Head title="Writing List" />

            <div className="py-4 px-6 text-gray-900 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                <div className="space-y-2">
                    {posts.map((post) => {
                        const statusColors = getStatusBadgeColor(post.status);
                        return (
                            <div
                                key={post.id}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                style={{ borderColor: '#e5e3df' }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <button
                                            onClick={() => toggleExpand(post.id)}
                                            className="flex items-center gap-2 text-left font-medium hover:opacity-70 transition"
                                            style={{ color: '#3d3d3d' }}
                                        >
                                            {expandedPostId === post.id ? (
                                                <ChevronDown size={20} style={{ color: '#7a9d7a' }} />
                                            ) : (
                                                <ChevronRight size={20} style={{ color: '#7a9d7a' }} />
                                            )}
                                            <span>{post.title}</span>
                                        </button>
                                        <span
                                            className="px-2 py-1 rounded text-xs font-medium"
                                            style={{ backgroundColor: statusColors.bg, color: statusColors.color }}
                                        >
                                            {post.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <a
                                            href={`/posts/${post.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white rounded-md transition hover:opacity-90"
                                            style={{ backgroundColor: '#7a9d7a' }}
                                            title="View writing"
                                        >
                                            <ExternalLink size={16} />
                                            View
                                        </a>

                                        <Link
                                            href={`/admin/posts/${post.slug}`}
                                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white rounded-md transition hover:opacity-90"
                                            style={{ backgroundColor: '#5a8a5a' }}
                                            title="Update writing"
                                        >
                                            <Edit size={16} />
                                            Update
                                        </Link>

                                        <button
                                            onClick={() => confirmDeletion(post)}
                                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md transition hover:bg-red-700"
                                            title="Delete writing"
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {expandedPostId === post.id && (
                                    <div
                                        className="mt-3 pt-3 border-t"
                                        style={{ borderColor: '#e5e3df' }}
                                    >
                                        {post.excerpt && (
                                            <div className="text-sm mb-3 italic" style={{ color: '#5a5a5a' }}>
                                                {post.excerpt}
                                            </div>
                                        )}
                                        <div className="text-sm mb-3 prose prose-sm max-w-none">
                                            <DescriptionRenderer
                                                content={post.description?.substring(0, 500) || ''}
                                                format={post.format}
                                                className="line-clamp-6"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-xs" style={{ color: '#7a7a7a' }}>
                                            <span>Format: <strong>{post.format}</strong></span>
                                            <span>•</span>
                                            <span>Reading time: <strong>{post.readTime}</strong></span>
                                            {post.publishedAt && (
                                                <>
                                                    <span>•</span>
                                                    <span>Published: <strong>{new Date(post.publishedAt).toLocaleDateString()}</strong></span>
                                                </>
                                            )}
                                        </div>
                                        {post.tags && post.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <span className="text-xs font-medium" style={{ color: '#7a7a7a' }}>Tags:</span>
                                                {post.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-1 rounded-full text-xs font-medium"
                                                        style={{ backgroundColor: '#e8f0e8', color: '#5a7a5a' }}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {posts.length === 0 && (
                        <div className="text-center py-8" style={{ color: '#7a7a7a' }}>
                            <p>No writing found. Create your first piece!</p>
                            <Link
                                href={route('admin.posts.create')}
                                className="inline-block mt-4 px-5 py-2.5 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                                style={{ backgroundColor: '#7a9d7a' }}
                            >
                                Create Writing
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={confirmingDeletion} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium" style={{ color: '#3d3d3d' }}>
                        Are you sure you want to delete this writing?
                    </h2>

                    <p className="mt-1 text-sm" style={{ color: '#7a7a7a' }}>
                        Once deleted, "{postToDelete?.title}" will be permanently removed. This action cannot be undone.
                    </p>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton onClick={deletePost}>
                            Delete Writing
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
