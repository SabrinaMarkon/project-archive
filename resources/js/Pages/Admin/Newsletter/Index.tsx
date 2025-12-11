import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DangerButton from "@/Components/DangerButton";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Download, Trash2, Mail, MailOpen, BarChart, PenSquare, CheckCircle, XCircle } from "lucide-react";

Index.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

interface NewsletterSubscriber {
    id: number;
    email: string;
    unsubscribed_at: string | null;
    created_at: string;
    updated_at: string;
}

interface NewsletterStats {
    total: number;
    active: number;
    unsubscribed: number;
    pending: number;
}

interface PaginatedSubscribers {
    data: NewsletterSubscriber[];
    links: any[];
    current_page: number;
    per_page: number;
    total: number;
}

export default function Index({
    subscribers,
    stats,
}: {
    subscribers: PaginatedSubscribers;
    stats: NewsletterStats;
}) {
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [subscriberToDelete, setSubscriberToDelete] = useState<NewsletterSubscriber | null>(null);
    const [filter, setFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('all');
    const [showFlash, setShowFlash] = useState(true);
    const { flash } = usePage().props as any;

    const confirmDeletion = (subscriber: NewsletterSubscriber) => {
        setSubscriberToDelete(subscriber);
        setConfirmingDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
        setSubscriberToDelete(null);
    };

    const deleteSubscriber = () => {
        if (subscriberToDelete) {
            if (subscriberToDelete.unsubscribed_at) {
                // Already unsubscribed, delete permanently
                router.delete(`/admin/newsletter-subscribers/${subscriberToDelete.id}`, {
                    preserveScroll: true,
                    onSuccess: () => closeModal(),
                });
            } else {
                // Active subscriber, just unsubscribe
                router.patch(`/admin/newsletter-subscribers/${subscriberToDelete.id}/unsubscribe`, {}, {
                    preserveScroll: true,
                    onSuccess: () => closeModal(),
                });
            }
        }
    };

    const handleExport = () => {
        window.location.href = '/admin/newsletter-subscribers/export';
    };

    const filteredSubscribers = subscribers.data.filter((subscriber) => {
        if (filter === 'subscribed') return !subscriber.unsubscribed_at;
        if (filter === 'unsubscribed') return subscriber.unsubscribed_at;
        return true;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight" style={{ color: '#3d3d3d' }}>
                    Newsletter Subscribers
                </h2>
            }
        >
            <Head title="Newsletter Subscribers" />

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

            <div className="py-4 px-6 text-gray-900 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="border rounded-lg p-4" style={{ borderColor: '#e5e3df' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart size={20} style={{ color: '#7a9d7a' }} />
                            <span className="text-sm font-medium" style={{ color: '#7a7a7a' }}>
                                Total
                            </span>
                        </div>
                        <div className="text-2xl font-bold" style={{ color: '#3d3d3d' }}>
                            {stats.total}
                        </div>
                    </div>

                    <div className="border rounded-lg p-4" style={{ borderColor: '#e5e3df' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <MailOpen size={20} style={{ color: '#7a9d7a' }} />
                            <span className="text-sm font-medium" style={{ color: '#7a7a7a' }}>
                                Active
                            </span>
                        </div>
                        <div className="text-2xl font-bold" style={{ color: '#3d3d3d' }}>
                            {stats.active}
                        </div>
                    </div>

                    <div className="border rounded-lg p-4" style={{ borderColor: '#e5e3df' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <Mail size={20} style={{ color: '#7a9d7a' }} />
                            <span className="text-sm font-medium" style={{ color: '#7a7a7a' }}>
                                Unsubscribed
                            </span>
                        </div>
                        <div className="text-2xl font-bold" style={{ color: '#3d3d3d' }}>
                            {stats.unsubscribed}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                                filter === 'all'
                                    ? 'text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            style={filter === 'all' ? { backgroundColor: '#7a9d7a' } : { color: '#5a5a5a' }}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('subscribed')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                                filter === 'subscribed'
                                    ? 'text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            style={filter === 'subscribed' ? { backgroundColor: '#7a9d7a' } : { color: '#5a5a5a' }}
                        >
                            Subscribed
                        </button>
                        <button
                            onClick={() => setFilter('unsubscribed')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                                filter === 'unsubscribed'
                                    ? 'text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            style={filter === 'unsubscribed' ? { backgroundColor: '#7a9d7a' } : { color: '#5a5a5a' }}
                        >
                            Unsubscribed
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href="/admin/newsletter/compose"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition hover:opacity-90"
                            style={{ backgroundColor: '#7a9d7a' }}
                        >
                            <PenSquare size={16} />
                            Compose Newsletter
                        </Link>

                        <Link
                            href="/admin/newsletter/history"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition hover:opacity-90"
                            style={{ backgroundColor: '#7a9d7a' }}
                        >
                            <Mail size={16} />
                            History
                        </Link>

                        <button
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition hover:opacity-90"
                            style={{ backgroundColor: '#7a9d7a' }}
                        >
                            <Download size={16} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Subscribers List */}
                <div className="space-y-2">
                    {filteredSubscribers.map((subscriber) => (
                        <div
                            key={subscriber.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            style={{ borderColor: '#e5e3df' }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium" style={{ color: '#3d3d3d' }}>
                                            {subscriber.email}
                                        </span>
                                        {subscriber.unsubscribed_at ? (
                                            <span
                                                className="px-2 py-1 rounded-full text-xs font-medium"
                                                style={{ backgroundColor: '#fee', color: '#c33' }}
                                            >
                                                Unsubscribed
                                            </span>
                                        ) : (
                                            <span
                                                className="px-2 py-1 rounded-full text-xs font-medium"
                                                style={{ backgroundColor: '#e8f0e8', color: '#5a7a5a' }}
                                            >
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm mt-1" style={{ color: '#7a7a7a' }}>
                                        Subscribed: {formatDate(subscriber.created_at)}
                                        {subscriber.unsubscribed_at && (
                                            <> • Unsubscribed: {formatDate(subscriber.unsubscribed_at)}</>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => confirmDeletion(subscriber)}
                                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md transition hover:bg-red-700"
                                    title={subscriber.unsubscribed_at ? "Delete permanently" : "Unsubscribe"}
                                >
                                    <Trash2 size={16} />
                                    {subscriber.unsubscribed_at ? 'Delete' : 'Unsubscribe'}
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredSubscribers.length === 0 && (
                        <div className="text-center py-8" style={{ color: '#7a7a7a' }}>
                            <p>No subscribers found.</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={confirmingDeletion} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium" style={{ color: '#3d3d3d' }}>
                        {subscriberToDelete?.unsubscribed_at
                            ? 'Delete this subscriber permanently?'
                            : 'Unsubscribe this email address?'}
                    </h2>

                    <p className="mt-1 text-sm" style={{ color: '#7a7a7a' }}>
                        {subscriberToDelete?.unsubscribed_at
                            ? `"${subscriberToDelete?.email}" will be permanently removed from the database. This action cannot be undone.`
                            : `"${subscriberToDelete?.email}" will be marked as unsubscribed and kept on the suppression list to prevent future contact.`}
                    </p>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton onClick={deleteSubscriber}>
                            {subscriberToDelete?.unsubscribed_at ? 'Delete Permanently' : 'Unsubscribe'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
