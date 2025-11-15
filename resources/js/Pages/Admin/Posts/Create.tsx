import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CharacterCount from "@/Components/CharacterCount";
import DangerButton from "@/Components/DangerButton";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Modal";
import DescriptionRenderer from "@/Components/DescriptionRenderer";
import SecondaryButton from "@/Components/SecondaryButton";
import TextareaAutosize from "react-textarea-autosize";
import { formatSlug } from "@/utils/validation";
import { formatDateTimeLocal } from "@/utils/date";
import { Head, useForm } from "@inertiajs/react";
import { Post } from "@/types/post";
import { Eye } from "lucide-react";

Create.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default function Create({ post }: { post: Post | null }) {
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [showingPreview, setShowingPreview] = useState(false);
    const [tagInput, setTagInput] = useState("");

    const { data, setData, post: postForm, put, delete: destroy, processing, errors } = useForm({
        title: post?.title ?? "",
        slug: post?.slug ?? "",
        description: post?.description ?? "",
        format: post?.format ?? "markdown",
        excerpt: post?.excerpt ?? "",
        status: post?.status ?? "draft",
        published_at: formatDateTimeLocal(post?.publishedAt),
        cover_image: post?.coverImage ?? "",
        tags: post?.tags ?? [],
        meta_title: post?.metaTitle ?? "",
        meta_description: post?.metaDescription ?? "",
        is_featured: post?.isFeatured ?? false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (post) {
            put(`/admin/posts/${post.slug}`);
        } else {
            postForm("/admin/posts");
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setData("title", value);

        if (!slugManuallyEdited) {
            setData("slug", formatSlug(value));
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = formatSlug(e.target.value);
        setData("slug", value);
        setSlugManuallyEdited(value !== "");
    };

    const handleSlugBlur = () => {
        const trimmed = data.slug.replace(/^-+|-+$/g, "");
        setData("slug", formatSlug(trimmed));
    };

    const regenerateSlug = () => {
        setData("slug", formatSlug(data.title));
        setSlugManuallyEdited(false);
    };

    const confirmDeletion = () => {
        setConfirmingDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
    };

    const deletePost = () => {
        destroy(`/admin/posts/${post?.slug}`, {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const addTag = () => {
        const trimmedTag = tagInput.trim();
        if (trimmedTag && !data.tags.includes(trimmedTag)) {
            setData("tags", [...data.tags, trimmedTag]);
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setData("tags", data.tags.filter((tag) => tag !== tagToRemove));
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight" style={{ color: '#3d3d3d' }}>
                    {post ? "Edit " : "Create "}Writing
                </h2>
            }
        >
            <Head title={post ? "Edit Writing" : "Create Writing"} />

            <div className="py-6 px-8 overflow-hidden bg-white shadow-sm sm:rounded-lg" style={{ color: '#3d3d3d' }}>
                <form onSubmit={submit} className="space-y-6 max-w-3xl">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block font-medium" style={{ color: '#3d3d3d' }}>
                            Title
                        </label>
                        <input
                            id="title"
                            value={data.title}
                            onChange={handleTitleChange}
                            className="w-full border rounded-md p-2.5 focus:outline-none focus:ring-2 transition"
                            style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                            onFocus={(e) => e.target.style.borderColor = '#7a9d7a'}
                            onBlur={(e) => { e.target.style.borderColor = '#e5e3df'; }}
                        />
                        <CharacterCount value={data.title} max={255} />
                        {errors.title && <div className="text-red-600">{errors.title}</div>}
                    </div>

                    {/* Slug */}
                    <div>
                        <label htmlFor="slug" className="block font-medium" style={{ color: '#3d3d3d' }}>
                            Slug
                        </label>
                        <input
                            id="slug"
                            value={data.slug}
                            onChange={handleSlugChange}
                            className="w-full border rounded-md p-2.5 focus:outline-none focus:ring-2 transition"
                            style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                            onFocus={(e) => e.target.style.borderColor = '#7a9d7a'}
                            onBlur={(e) => { handleSlugBlur(); e.target.style.borderColor = '#e5e3df'; }}
                        />
                        <button
                            type="button"
                            className="text-sm underline hover:opacity-70 transition"
                            style={{ color: '#7a9d7a' }}
                            onClick={regenerateSlug}
                        >
                            Regenerate
                        </button>
                        <CharacterCount value={data.slug} max={255} />
                        {errors.slug && <div className="text-red-600">{errors.slug}</div>}
                    </div>

                    {/* Status and Format */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="status" className="block font-medium" style={{ color: '#3d3d3d' }}>
                                Status
                            </label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData("status", e.target.value as "draft" | "published" | "archived")}
                                className="w-full border rounded-md p-2.5 focus:outline-none focus:ring-2 transition"
                                style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                                onFocus={(e) => e.target.style.borderColor = '#7a9d7a'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e3df'}
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                            {errors.status && <div className="text-red-600 text-sm">{errors.status}</div>}
                        </div>

                        <div>
                            <label htmlFor="format" className="block font-medium" style={{ color: '#3d3d3d' }}>
                                Format
                            </label>
                            <select
                                id="format"
                                value={data.format}
                                onChange={(e) => setData("format", e.target.value as "html" | "markdown" | "plaintext")}
                                className="w-full border rounded-md p-2.5 focus:outline-none focus:ring-2 transition"
                                style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                                onFocus={(e) => e.target.style.borderColor = '#7a9d7a'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e3df'}
                            >
                                <option value="markdown">Markdown</option>
                                <option value="html">HTML</option>
                                <option value="plaintext">Plain Text</option>
                            </select>
                            {errors.format && <div className="text-red-600 text-sm">{errors.format}</div>}
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label htmlFor="excerpt" className="block font-medium" style={{ color: '#3d3d3d' }}>
                            Excerpt
                        </label>
                        <TextareaAutosize
                            id="excerpt"
                            value={data.excerpt}
                            onChange={(e) => setData("excerpt", e.target.value)}
                            minRows={2}
                            maxRows={5}
                            className="mt-1 block w-full border rounded-md shadow-sm p-2.5 text-base focus:outline-none focus:ring-2 transition"
                            style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                            onFocus={(e) => e.target.style.borderColor = '#7a9d7a'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e3df'}
                            placeholder="Short summary of the post"
                        />
                        <CharacterCount value={data.excerpt} max={500} />
                        {errors.excerpt && <div className="text-red-600">{errors.excerpt}</div>}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block font-medium" style={{ color: '#3d3d3d' }}>
                            Content
                        </label>
                        <TextareaAutosize
                            id="description"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            minRows={10}
                            maxRows={30}
                            className="mt-1 block w-full border rounded-md shadow-sm p-2.5 text-base focus:outline-none focus:ring-2 transition font-mono"
                            style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                            onFocus={(e) => e.target.style.borderColor = '#7a9d7a'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e3df'}
                            placeholder="Write your post content here..."
                        />
                        {errors.description && <div className="text-red-600">{errors.description}</div>}
                    </div>

                    {/* Tags */}
                    <div>
                        <label htmlFor="tags" className="block font-medium" style={{ color: '#3d3d3d' }}>
                            Tags
                        </label>
                        <div className="flex gap-2 mt-1">
                            <input
                                id="tags"
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagInputKeyDown}
                                placeholder="Type a tag and press Enter"
                                className="flex-1 border rounded-md p-2.5 focus:outline-none focus:ring-2 transition"
                                style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                                onFocus={(e) => e.target.style.borderColor = '#7a9d7a'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e3df'}
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="px-4 py-2.5 text-white rounded-md hover:opacity-90 transition"
                                style={{ backgroundColor: '#7a9d7a' }}
                            >
                                Add Tag
                            </button>
                        </div>
                        {data.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {data.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                                        style={{ backgroundColor: '#e8f0e8', color: '#3d3d3d' }}
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="hover:opacity-70 transition"
                                            style={{ color: '#7a9d7a' }}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        {errors.tags && <div className="text-red-600 text-sm mt-1">{errors.tags}</div>}
                    </div>

                    {/* Cover Image URL */}
                    <div>
                        <label htmlFor="cover_image" className="block font-medium" style={{ color: '#3d3d3d' }}>
                            Cover Image URL
                        </label>
                        <input
                            id="cover_image"
                            type="text"
                            value={data.cover_image}
                            onChange={(e) => setData("cover_image", e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="mt-1 block w-full border rounded-md p-2.5 focus:outline-none focus:ring-2 transition"
                            style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                            onFocus={(e) => e.target.style.borderColor = '#7a9d7a'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e3df'}
                        />
                        {errors.cover_image && <div className="text-red-600 text-sm mt-1">{errors.cover_image}</div>}
                    </div>

                    {/* Published Date */}
                    <div>
                        <label htmlFor="published_at" className="block font-medium" style={{ color: '#3d3d3d' }}>
                            Published Date
                        </label>
                        <input
                            id="published_at"
                            type="datetime-local"
                            value={data.published_at}
                            onChange={(e) => setData("published_at", e.target.value)}
                            className="mt-1 block w-full border rounded-md p-2.5 focus:outline-none focus:ring-2 transition"
                            style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                            onFocus={(e) => e.target.style.borderColor = '#7a9d7a'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e3df'}
                        />
                        {errors.published_at && <div className="text-red-600 text-sm mt-1">{errors.published_at}</div>}
                    </div>

                    {/* SEO Meta Fields */}
                    <div className="space-y-4 pt-4 border-t" style={{ borderColor: '#e5e3df' }}>
                        <h3 className="font-semibold text-lg" style={{ color: '#3d3d3d' }}>SEO Meta Tags</h3>

                        <div>
                            <label htmlFor="meta_title" className="block font-medium" style={{ color: '#3d3d3d' }}>
                                Meta Title
                            </label>
                            <input
                                id="meta_title"
                                type="text"
                                value={data.meta_title}
                                onChange={(e) => setData("meta_title", e.target.value)}
                                placeholder="Leave blank to use writing title"
                                className="mt-1 block w-full border rounded-md p-2.5 focus:outline-none focus:ring-2 transition"
                                style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                                onFocus={(e) => e.target.style.borderColor = '#7a9d7a'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e3df'}
                            />
                            <CharacterCount value={data.meta_title} max={255} />
                            {errors.meta_title && <div className="text-red-600 text-sm mt-1">{errors.meta_title}</div>}
                        </div>

                        <div>
                            <label htmlFor="meta_description" className="block font-medium" style={{ color: '#3d3d3d' }}>
                                Meta Description
                            </label>
                            <TextareaAutosize
                                id="meta_description"
                                value={data.meta_description}
                                onChange={(e) => setData("meta_description", e.target.value)}
                                minRows={2}
                                maxRows={4}
                                placeholder="Leave blank to use excerpt"
                                className="mt-1 block w-full border rounded-md p-2.5 focus:outline-none focus:ring-2 transition"
                                style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                                onFocus={(e) => e.target.style.borderColor = '#7a9d7a'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e3df'}
                            />
                            <CharacterCount value={data.meta_description} max={255} />
                            {errors.meta_description && <div className="text-red-600 text-sm mt-1">{errors.meta_description}</div>}
                        </div>
                    </div>

                    {/* Featured Checkbox */}
                    <div className="flex items-center gap-2">
                        <input
                            id="is_featured"
                            type="checkbox"
                            checked={data.is_featured}
                            onChange={(e) => setData("is_featured", e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor="is_featured" className="font-medium" style={{ color: '#3d3d3d' }}>
                            Featured Writing
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="text-white px-6 py-2.5 rounded-md hover:opacity-90 transition disabled:opacity-50"
                            style={{ backgroundColor: '#7a9d7a' }}
                        >
                            {post ? "Update" : "Create"} Writing
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowingPreview(true)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 border-2 rounded-md hover:opacity-70 transition"
                            style={{ borderColor: '#7a9d7a', color: '#7a9d7a' }}
                        >
                            <Eye size={18} />
                            Preview
                        </button>

                        {post && (
                            <DangerButton type="button" onClick={confirmDeletion}>
                                Delete Writing
                            </DangerButton>
                        )}
                    </div>
                </form>
            </div>

            <Modal show={confirmingDeletion} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium" style={{ color: '#3d3d3d' }}>
                        Are you sure you want to delete this writing?
                    </h2>
                    <p className="mt-1 text-sm" style={{ color: '#7a7a7a' }}>
                        Once this writing is deleted, all of its data will be permanently removed. This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                        <DangerButton onClick={deletePost} disabled={processing}>
                            Delete Writing
                        </DangerButton>
                    </div>
                </div>
            </Modal>

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
                            {data.title || 'Untitled Post'}
                        </h1>

                        {data.excerpt && (
                            <div className="mb-6 pb-6 border-b" style={{ borderColor: '#e5e3df' }}>
                                <p className="text-lg italic" style={{ color: '#7a7a7a' }}>
                                    {data.excerpt}
                                </p>
                            </div>
                        )}

                        <div className="prose prose-lg max-w-none">
                            <DescriptionRenderer
                                content={data.description}
                                format={data.format as 'html' | 'markdown' | 'plaintext'}
                            />
                        </div>

                        {data.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t" style={{ borderColor: '#e5e3df' }}>
                                {data.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 rounded-full text-sm font-medium"
                                        style={{ backgroundColor: '#e8f0e8', color: '#5a7a5a' }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
