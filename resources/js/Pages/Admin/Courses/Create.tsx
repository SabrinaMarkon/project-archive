import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DangerButton from "@/Components/DangerButton";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TextareaAutosize from "react-textarea-autosize";
import { Head, useForm, router } from "@inertiajs/react";
import { Lock, Unlock, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";

interface Post {
    id: number;
    title: string;
    slug?: string;
    excerpt?: string | null;
    description?: string | null;
}

interface CourseModule {
    id: number;
    post_id: number;
    is_free: boolean;
    custom_description?: string;
    order: number;
    post: Post;
}

interface Course {
    id: number;
    title: string;
    description: string | null;
    price: string;
    payment_type: 'one_time' | 'monthly' | 'annual';
    stripe_enabled: boolean;
    paypal_enabled: boolean;
    modules: CourseModule[];
}

Create.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default function Create({
    course,
    availablePosts
}: {
    course: Course | null;
    availablePosts: Post[]
}) {
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    const [newModuleIsFree, setNewModuleIsFree] = useState(true);
    const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());

    const { data, setData, post, put, processing, errors } = useForm({
        title: course?.title ?? "",
        description: course?.description ?? "",
        price: course?.price ?? "",
        payment_type: course?.payment_type ?? 'one_time',
        stripe_enabled: course?.stripe_enabled ?? true,
        paypal_enabled: course?.paypal_enabled ?? false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (course) {
            put(`/admin/courses/${course.id}`);
        } else {
            post("/admin/courses");
        }
    };

    const confirmDeletion = () => {
        setConfirmingDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
    };

    const deleteCourse = () => {
        if (course) {
            router.delete(`/admin/courses/${course.id}`, {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const addModule = () => {
        if (!course || !selectedPostId) return;

        router.post(`/admin/courses/${course.id}/modules`, {
            post_id: selectedPostId,
            is_free: newModuleIsFree,
            order: course.modules.length,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedPostId(null);
                setNewModuleIsFree(true);
            },
        });
    };

    const removeModule = (moduleId: number) => {
        if (!course) return;

        router.delete(`/admin/courses/${course.id}/modules/${moduleId}`, {
            preserveScroll: true,
        });
    };

    const toggleModuleFree = (moduleId: number, currentIsFree: boolean, order: number) => {
        if (!course) return;

        router.patch(`/admin/courses/${course.id}/modules/${moduleId}`, {
            is_free: !currentIsFree,
            order: order,
        }, {
            preserveScroll: true,
        });
    };

    const getAvailablePostsForModule = () => {
        if (!course) return availablePosts;

        const usedPostIds = course.modules.map(m => m.post_id);
        return availablePosts.filter(post => !usedPostIds.includes(post.id));
    };

    const toggleModule = (moduleId: number) => {
        setExpandedModules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(moduleId)) {
                newSet.delete(moduleId);
            } else {
                newSet.add(moduleId);
            }
            return newSet;
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight" style={{ color: '#3d3d3d' }}>
                    {course ? "Edit " : "Create "}Course
                </h2>
            }
        >
            <Head title={course ? "Edit Course" : "Create Course"} />

            <div className="py-6 px-8 overflow-hidden bg-white shadow-sm sm:rounded-lg" style={{ color: '#3d3d3d' }}>
                <form onSubmit={submit} className="space-y-6 max-w-3xl">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block font-medium mb-2" style={{ color: '#3d3d3d' }}>
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            className="w-full border rounded-md p-2.5 focus:outline-none focus:ring-2 transition"
                            style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                            onFocus={(e) => e.target.style.borderColor = '#7a9d7a'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e3df'}
                            required
                        />
                        {errors.title && (
                            <div className="text-red-600 text-sm mt-1">{errors.title}</div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block font-medium mb-2" style={{ color: '#3d3d3d' }}>
                            Description
                        </label>
                        <TextareaAutosize
                            id="description"
                            value={data.description || ''}
                            onChange={(e) => setData("description", e.target.value)}
                            className="w-full border rounded-md p-2.5 focus:outline-none focus:ring-2 transition resize-none"
                            style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#7a9d7a'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#e5e3df'}
                            minRows={3}
                        />
                        {errors.description && (
                            <div className="text-red-600 text-sm mt-1">{errors.description}</div>
                        )}
                    </div>

                    {/* Price */}
                    <div>
                        <label htmlFor="price" className="block font-medium mb-2" style={{ color: '#3d3d3d' }}>
                            Price
                        </label>
                        <div className="flex items-center">
                            <span className="mr-2 text-lg font-medium" style={{ color: '#7a7a7a' }}>$</span>
                            <input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.price}
                                onChange={(e) => setData("price", e.target.value)}
                                className="w-full border rounded-md p-2.5 focus:outline-none focus:ring-2 transition"
                                style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                                onFocus={(e) => e.target.style.borderColor = '#7a9d7a'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e3df'}
                                required
                            />
                        </div>
                        {errors.price && (
                            <div className="text-red-600 text-sm mt-1">{errors.price}</div>
                        )}
                    </div>

                    {/* Payment Type */}
                    <div>
                        <label htmlFor="payment_type" className="block font-medium mb-2" style={{ color: '#3d3d3d' }}>
                            Payment Type
                        </label>
                        <select
                            id="payment_type"
                            value={data.payment_type}
                            onChange={(e) => setData("payment_type", e.target.value as 'one_time' | 'monthly' | 'annual')}
                            className="w-full border rounded-md p-2.5 focus:outline-none focus:ring-2 transition"
                            style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                            onFocus={(e) => e.target.style.borderColor = '#7a9d7a'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e3df'}
                            required
                        >
                            <option value="one_time">One-time</option>
                            <option value="monthly">Monthly</option>
                            <option value="annual">Annual</option>
                        </select>
                        {errors.payment_type && (
                            <div className="text-red-600 text-sm mt-1">{errors.payment_type}</div>
                        )}
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-3">
                        <h3 className="font-medium" style={{ color: '#3d3d3d' }}>Payment Methods</h3>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.stripe_enabled}
                                onChange={(e) => setData("stripe_enabled", e.target.checked)}
                                className="w-4 h-4 rounded focus:ring-2"
                                style={{ accentColor: '#7a9d7a' }}
                            />
                            <span style={{ color: '#3d3d3d' }}>Enable Stripe</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.paypal_enabled}
                                onChange={(e) => setData("paypal_enabled", e.target.checked)}
                                className="w-4 h-4 rounded focus:ring-2"
                                style={{ accentColor: '#7a9d7a' }}
                            />
                            <span style={{ color: '#3d3d3d' }}>Enable PayPal</span>
                        </label>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center gap-3">
                        <PrimaryButton type="submit" disabled={processing}>
                            {course ? "Update Course" : "Create Course"}
                        </PrimaryButton>

                        {course && (
                            <DangerButton type="button" onClick={confirmDeletion}>
                                Delete Course
                            </DangerButton>
                        )}
                    </div>
                </form>

                {/* Modules Section - Only shown when editing */}
                {course && (
                    <div className="mt-10 pt-10 border-t max-w-3xl" style={{ borderColor: '#e5e3df' }}>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: '#3d3d3d' }}>
                            Course Modules
                        </h3>

                        {/* Current Modules */}
                        {course.modules.length > 0 ? (
                            <div className="space-y-2 mb-6">
                                {course.modules.map((module, index) => {
                                    const isExpanded = expandedModules.has(module.id);
                                    const modulePreview = module.post.excerpt || module.post.description?.substring(0, 200) || 'No preview available';

                                    return (
                                        <div
                                            key={module.id}
                                            className="border rounded-md overflow-hidden"
                                            style={{ borderColor: '#e5e3df' }}
                                        >
                                            <div className="flex items-center justify-between p-3">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <span className="text-sm font-medium" style={{ color: '#7a7a7a' }}>
                                                        {index + 1}.
                                                    </span>
                                                    <span style={{ color: '#3d3d3d' }}>{module.post.title}</span>
                                                    {module.is_free ? (
                                                        <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
                                                            <Unlock size={12} className="inline mr-1" />
                                                            Free
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}>
                                                            <Lock size={12} className="inline mr-1" />
                                                            Paid
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleModuleFree(module.id, module.is_free, module.order)}
                                                        className="px-3 py-1 text-sm rounded-md transition"
                                                        style={{ backgroundColor: '#f0f0f0', color: '#3d3d3d' }}
                                                    >
                                                        {module.is_free ? 'Make Paid' : 'Make Free'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeModule(module.id)}
                                                        className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition"
                                                    >
                                                        <Trash2 size={14} className="inline mr-1" />
                                                        Remove
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleModule(module.id)}
                                                        className="p-1.5 hover:bg-gray-100 rounded transition"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp size={18} style={{ color: '#7a9d7a' }} />
                                                        ) : (
                                                            <ChevronDown size={18} style={{ color: '#7a9d7a' }} />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="px-3 pb-3 pt-2 border-t" style={{ borderColor: '#e5e3df', backgroundColor: '#f9f9f9' }}>
                                                    <h5 className="text-xs font-semibold mb-1" style={{ color: '#7a9d7a' }}>
                                                        What students will learn:
                                                    </h5>
                                                    <p className="text-sm" style={{ color: '#5a5a5a' }}>
                                                        {modulePreview}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm mb-6" style={{ color: '#7a7a7a' }}>
                                <em>No modules added yet.</em>
                            </p>
                        )}

                        {/* Add Module */}
                        <div className="p-4 rounded-md" style={{ backgroundColor: '#f9f9f9' }}>
                            <h4 className="font-medium mb-3" style={{ color: '#3d3d3d' }}>Add Module</h4>

                            {getAvailablePostsForModule().length > 0 ? (
                                <div className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <label htmlFor="post_select" className="block text-sm font-medium mb-1" style={{ color: '#3d3d3d' }}>
                                            Select Post
                                        </label>
                                        <select
                                            id="post_select"
                                            value={selectedPostId || ''}
                                            onChange={(e) => setSelectedPostId(Number(e.target.value))}
                                            className="w-full border rounded-md p-2 focus:outline-none focus:ring-2"
                                            style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                                        >
                                            <option value="">-- Select a post --</option>
                                            {getAvailablePostsForModule().map((post) => (
                                                <option key={post.id} value={post.id}>
                                                    {post.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 mb-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newModuleIsFree}
                                                onChange={(e) => setNewModuleIsFree(e.target.checked)}
                                                className="w-4 h-4 rounded"
                                                style={{ accentColor: '#7a9d7a' }}
                                            />
                                            <span className="text-sm" style={{ color: '#3d3d3d' }}>Free Module</span>
                                        </label>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addModule}
                                        disabled={!selectedPostId}
                                        className="px-4 py-2 text-white rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: '#7a9d7a' }}
                                    >
                                        <Plus size={16} className="inline mr-1" />
                                        Add Module
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm" style={{ color: '#7a7a7a' }}>
                                    All published posts have been added to this course.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Message for new courses */}
                {!course && (
                    <div className="mt-10 pt-10 border-t max-w-3xl" style={{ borderColor: '#e5e3df' }}>
                        <p className="text-sm" style={{ color: '#7a7a7a' }}>
                            <em>Save the course first to add modules.</em>
                        </p>
                    </div>
                )}
            </div>

            <Modal show={confirmingDeletion} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium" style={{ color: '#3d3d3d' }}>
                        Are you sure you want to delete this course?
                    </h2>

                    <p className="mt-1 text-sm" style={{ color: '#7a7a7a' }}>
                        Once deleted, "{course?.title}" will be permanently removed. This action cannot be undone.
                    </p>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton onClick={deleteCourse}>
                            Delete Course
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
