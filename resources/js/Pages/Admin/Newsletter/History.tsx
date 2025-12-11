import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DashboardLayout from "@/Layouts/DashboardLayout";
import DescriptionRenderer from "@/Components/DescriptionRenderer";
import Modal from "@/Components/Modal";
import DangerButton from "@/Components/DangerButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Eye, Trash2, Calendar, Users, FileText, CheckCircle, XCircle } from "lucide-react";

interface NewsletterSend {
    id: number;
    subject: string;
    body: string;
    format: string;
    recipient_count: number;
    sent_at: string;
    created_at: string;
    updated_at: string;
}

interface PaginatedNewsletters {
    data: NewsletterSend[];
    links: any[];
    current_page: number;
    per_page: number;
    total: number;
}

History.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default function History({ newsletters }: { newsletters: PaginatedNewsletters }) {
    const [showingView, setShowingView] = useState(false);
    const [showingDelete, setShowingDelete] = useState(false);
    const [selectedNewsletter, setSelectedNewsletter] = useState<NewsletterSend | null>(null);
    const [showFlash, setShowFlash] = useState(true);
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleView = (newsletter: NewsletterSend) => {
        setSelectedNewsletter(newsletter);
        setShowingView(true);
    };

    const handleDeleteClick = (newsletter: NewsletterSend) => {
        setSelectedNewsletter(newsletter);
        setShowingDelete(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedNewsletter) {
            router.delete(`/admin/newsletter/history/${selectedNewsletter.id}`);
            setShowingDelete(false);
            setSelectedNewsletter(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFormatBadgeColor = (format: string) => {
        switch (format) {
            case 'markdown':
                return '#4a9eff';
            case 'html':
            case 'html_editor':
                return '#ff6b6b';
            case 'plaintext':
                return '#7a7a7a';
            default:
                return '#7a9d7a';
        }
    };

    const getFormatDisplay = (format: string) => {
        if (format === 'html_editor') return 'HTML Editor';
        return format;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight" style={{ color: "#3d3d3d" }}>
                    Newsletter History
                </h2>
            }
        >
            <Head title="Newsletter History" />

            {/* Flash Messages */}
            {showFlash && flash?.success && (
                <div className="mb-4 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: '#d1f2eb', borderLeft: '4px solid #28a745' }}>
                    <CheckCircle size={24} style={{ color: '#28a745' }} />
                    <div className="flex-1">
                        <p className="font-medium" style={{ color: '#155724' }}>{flash.success}</p>
                    </div>
                    <button onClick={() => setShowFlash(false)} className="text-2xl font-bold" style={{ color: '#155724' }}>×</button>
                </div>
            )}

            {showFlash && flash?.error && (
                <div className="mb-4 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: '#f8d7da', borderLeft: '4px solid #dc3545' }}>
                    <XCircle size={24} style={{ color: '#dc3545' }} />
                    <div className="flex-1">
                        <p className="font-medium" style={{ color: '#721c24' }}>{flash.error}</p>
                    </div>
                    <button onClick={() => setShowFlash(false)} className="text-2xl font-bold" style={{ color: '#721c24' }}>×</button>
                </div>
            )}

            {/* Navigation Links */}
            <div className="mb-4 flex gap-4">
                <Link
                    href="/admin/newsletter/compose"
                    className="inline-flex items-center px-6 py-2.5 border-2 rounded-md font-medium hover:opacity-70 transition"
                    style={{ borderColor: '#7a9d7a', color: '#7a9d7a' }}
                >
                    Compose Newsletter
                </Link>
                <Link
                    href="/admin/newsletter-subscribers"
                    className="inline-flex items-center px-6 py-2.5 border-2 rounded-md font-medium hover:opacity-70 transition"
                    style={{ borderColor: '#7a9d7a', color: '#7a9d7a' }}
                >
                    Subscribers
                </Link>
            </div>

            <div className="py-4 px-6 text-gray-900 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                {newsletters.data.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-lg" style={{ color: '#7a7a7a' }}>No newsletters have been sent yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {newsletters.data.map((newsletter) => (
                            <div
                                key={newsletter.id}
                                className="p-4 border rounded-lg hover:shadow-md transition"
                                style={{ borderColor: '#e5e3df' }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#2d2d2d' }}>
                                            {newsletter.subject}
                                        </h3>

                                        <div className="flex flex-wrap gap-4 text-sm mb-3" style={{ color: '#7a7a7a' }}>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} />
                                                <span>{formatDate(newsletter.sent_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users size={16} />
                                                <span>{newsletter.recipient_count} recipients</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FileText size={16} />
                                                <span
                                                    className="px-2 py-1 rounded text-white text-xs font-medium"
                                                    style={{ backgroundColor: getFormatBadgeColor(newsletter.format) }}
                                                >
                                                    {getFormatDisplay(newsletter.format)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleView(newsletter)}
                                            className="inline-flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 transition"
                                            style={{ borderColor: '#7a9d7a', color: '#7a9d7a' }}
                                        >
                                            <Eye size={16} />
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(newsletter)}
                                            className="inline-flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-red-50 transition"
                                            style={{ borderColor: '#dc3545', color: '#dc3545' }}
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {newsletters.links.length > 3 && (
                    <div className="mt-6 flex justify-center gap-2">
                        {newsletters.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-4 py-2 border rounded-md ${link.active ? 'font-bold' : ''} ${!link.url ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                style={{ borderColor: '#e5e3df', color: link.active ? '#7a9d7a' : '#7a7a7a' }}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* View Modal */}
            <Modal show={showingView} onClose={() => setShowingView(false)} maxWidth="2xl">
                <div className="p-6 max-h-screen overflow-y-auto">
                    <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 z-10">
                        <h2 className="text-2xl font-bold" style={{ color: '#3d3d3d' }}>
                            Newsletter Details
                        </h2>
                        <SecondaryButton onClick={() => setShowingView(false)}>
                            Close
                        </SecondaryButton>
                    </div>

                    {selectedNewsletter && (
                        <div className="border rounded-lg p-6" style={{ borderColor: '#e5e3df', backgroundColor: '#f9f8f6' }}>
                            <h1 className="text-3xl font-bold mb-4" style={{ color: '#2d2d2d' }}>
                                {selectedNewsletter.subject}
                            </h1>

                            <div className="mb-4 pb-4 border-b flex flex-wrap gap-4 text-sm" style={{ borderColor: '#e5e3df', color: '#7a7a7a' }}>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span><strong>Sent:</strong> {formatDate(selectedNewsletter.sent_at)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={16} />
                                    <span><strong>Recipients:</strong> {selectedNewsletter.recipient_count}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText size={16} />
                                    <span><strong>Format:</strong> <span className="capitalize">{getFormatDisplay(selectedNewsletter.format)}</span></span>
                                </div>
                            </div>

                            <div className="prose prose-lg max-w-none">
                                <DescriptionRenderer
                                    content={selectedNewsletter.body}
                                    format={selectedNewsletter.format === 'html_editor' ? 'html' : selectedNewsletter.format as 'html' | 'markdown' | 'plaintext'}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showingDelete} onClose={() => setShowingDelete(false)}>
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4" style={{ color: '#3d3d3d' }}>
                        Delete this newsletter permanently?
                    </h2>
                    {selectedNewsletter && (
                        <p className="mb-6" style={{ color: '#7a7a7a' }}>
                            Are you sure you want to delete "<strong>{selectedNewsletter.subject}</strong>"? This action cannot be undone.
                        </p>
                    )}
                    <div className="flex items-center justify-end gap-4">
                        <SecondaryButton onClick={() => setShowingDelete(false)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={handleDeleteConfirm}>
                            Delete Permanently
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
