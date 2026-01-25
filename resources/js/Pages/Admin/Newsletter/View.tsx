import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DashboardLayout from "@/Layouts/DashboardLayout";
import DescriptionRenderer from "@/Components/DescriptionRenderer";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, Calendar, Users, FileText } from "lucide-react";

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

View.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default function View({ newsletter }: { newsletter: NewsletterSend }) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFormatDisplay = (format: string) => {
        if (format === 'html_editor') return 'HTML Editor';
        return format;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight" style={{ color: "#3d3d3d" }}>
                    Newsletter Details
                </h2>
            }
        >
            <Head title={`Newsletter - ${newsletter.subject}`} />

            {/* Back Link */}
            <div className="mb-4">
                <Link
                    href={route('admin.newsletter.history')}
                    className="inline-flex items-center gap-2 px-4 py-2 border-2 rounded-md font-medium hover:opacity-70 transition"
                    style={{ borderColor: '#7a9d7a', color: '#7a9d7a' }}
                >
                    <ArrowLeft size={18} />
                    Back to History
                </Link>
            </div>

            <div className="py-6 px-6 text-gray-900 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                <h1 className="text-3xl font-bold mb-6" style={{ color: '#2d2d2d' }}>
                    {newsletter.subject}
                </h1>

                <div className="mb-6 pb-6 border-b flex flex-wrap gap-6 text-sm" style={{ borderColor: '#e5e3df', color: '#7a7a7a' }}>
                    <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        <span><strong>Sent:</strong> {formatDate(newsletter.sent_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={18} />
                        <span><strong>Recipients:</strong> {newsletter.recipient_count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileText size={18} />
                        <span><strong>Format:</strong> <span className="capitalize">{getFormatDisplay(newsletter.format)}</span></span>
                    </div>
                </div>

                <div className="prose prose-lg max-w-none">
                    <DescriptionRenderer
                        content={newsletter.body}
                        format={newsletter.format === 'html_editor' ? 'html' : newsletter.format as 'html' | 'markdown' | 'plaintext'}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
