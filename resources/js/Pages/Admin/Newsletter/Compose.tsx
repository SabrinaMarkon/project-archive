import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DashboardLayout from "@/Layouts/DashboardLayout";
import DescriptionRenderer from "@/Components/DescriptionRenderer";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TipTapEditor from "@/Components/TipTapEditor";
import { Head, useForm, usePage } from "@inertiajs/react";
import { Eye, CheckCircle, XCircle } from "lucide-react";

Compose.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default function Compose() {
    const [showingPreview, setShowingPreview] = useState(false);
    const [showFlash, setShowFlash] = useState(true);
    const { flash } = usePage().props as any;

    const { data, setData, post, processing, errors } = useForm({
        subject: "",
        body: "",
        format: "markdown" as "markdown" | "html" | "html_editor" | "plaintext",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/admin/newsletter/send");
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
                <h2 className="text-xl font-semibold leading-tight" style={{ color: "#3d3d3d" }}>
                    Compose Newsletter
                </h2>
            }
        >
            <Head title="Compose Newsletter" />

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
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <InputLabel htmlFor="subject" value="Subject" />
                        <TextInput
                            id="subject"
                            type="text"
                            value={data.subject}
                            onChange={(e) => setData("subject", e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.subject} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="format" value="Format" />
                        <select
                            id="format"
                            value={data.format}
                            onChange={(e) => setData("format", e.target.value as any)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="markdown">Markdown</option>
                            <option value="html">HTML</option>
                            <option value="html_editor">HTML Editor</option>
                            <option value="plaintext">Plain Text</option>
                        </select>
                        <InputError message={errors.format} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="body" value="Body" />
                        {data.format === 'html_editor' ? (
                            <TipTapEditor
                                value={data.body}
                                onChange={(value) => setData("body", value)}
                                className="mt-1"
                            />
                        ) : (
                            <textarea
                                id="body"
                                value={data.body}
                                onChange={(e) => setData("body", e.target.value)}
                                rows={15}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                        )}
                        <InputError message={errors.body} className="mt-2" />
                    </div>

                    <div className="flex items-center gap-4">
                        <PrimaryButton disabled={processing}>
                            Send Newsletter
                        </PrimaryButton>

                        <button
                            type="button"
                            onClick={() => setShowingPreview(true)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 border-2 rounded-md hover:opacity-70 transition"
                            style={{ borderColor: '#7a9d7a', color: '#7a9d7a' }}
                        >
                            <Eye size={18} />
                            Preview
                        </button>
                    </div>
                </form>
            </div>

            <Modal show={showingPreview} onClose={() => setShowingPreview(false)} maxWidth="2xl">
                <div className="p-6 max-h-screen overflow-y-auto">
                    <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 z-10">
                        <h2 className="text-2xl font-bold" style={{ color: '#3d3d3d' }}>
                            Preview
                        </h2>
                        <SecondaryButton onClick={() => setShowingPreview(false)}>
                            Close
                        </SecondaryButton>
                    </div>

                    <div className="border rounded-lg p-6 overflow-y-auto" style={{ borderColor: '#e5e3df', backgroundColor: '#f9f8f6', maxHeight: 'calc(100vh - 200px)' }}>
                        <h1 className="text-3xl font-bold mb-4" style={{ color: '#2d2d2d' }}>
                            {data.subject || 'No Subject'}
                        </h1>

                        <div className="mb-4 pb-4 border-b text-sm" style={{ borderColor: '#e5e3df', color: '#7a7a7a' }}>
                            Format: <span className="font-medium capitalize">{data.format === 'html_editor' ? 'HTML Editor' : data.format}</span>
                        </div>

                        <div className="prose prose-lg max-w-none">
                            <DescriptionRenderer
                                content={data.body}
                                format={data.format === 'html_editor' ? 'html' : data.format as 'html' | 'markdown' | 'plaintext'}
                            />
                        </div>

                        <div className="mt-6 pt-6 border-t text-sm" style={{ borderColor: '#e5e3df', color: '#7a7a7a' }}>
                            <a href="#" className="text-blue-600 hover:underline">Unsubscribe from this newsletter</a>
                        </div>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
