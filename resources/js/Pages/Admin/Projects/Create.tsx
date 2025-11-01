import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CharacterCount from "@/Components/CharacterCount";
import DangerButton from "@/Components/DangerButton";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import TextareaAutosize from "react-textarea-autosize";
import * as validation from "@/constants/validation";
import { formatSlug } from "@/utils/validation";
import { Head, useForm } from "@inertiajs/react";
import { Project } from "@/types/project";

Create.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default function Create({ project }: { project: Project | null }) {
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [tagInput, setTagInput] = useState("");

    const { data, setData, post, put, delete: destroy, processing, errors } = useForm({
        id: project?.id ?? null, // If project exists, use its ID, otherwise null for new
        title: project?.title ?? "",
        slug: project?.slug ?? "",
        excerpt: project?.excerpt ?? "",
        description: project?.description ?? "",
        tags: project?.tags ?? [],
    });

    // Submit handler for creating or updating a project
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.id) {
            // Update existing project using the original slug from the route
            put(`/admin/projects/${project?.slug}`);
        } else {
            // Create a new project
            post("/admin/projects");
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

    const deleteProject = () => {
        destroy(`/admin/projects/${project?.slug}`, {
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

    useEffect(() => {
        if (project) {
            // If the project exists, populate form with existing data
            setData({
                id: project.id,
                title: project.title,
                slug: project.slug,
                excerpt: project.excerpt ?? "",
                description: project.description ?? "",
                tags: project.tags ?? [],
            });
        }
    }, [project]); // Runs whenever the `project` prop changes

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight" style={{ color: '#3d3d3d' }}>
                    {data.id ? "Edit " : "Create "}
                    Project
                </h2>
            }
        >
            <Head title={data.id ? "Edit Project" : "Create Project"} />

            <div className="py-6 px-8 overflow-hidden bg-white shadow-sm sm:rounded-lg" style={{ color: '#3d3d3d' }}>
                <form onSubmit={submit} className="space-y-6 max-w-xl">
                    <div>
                        {data.id && (
                            <input type="hidden" name="id" value={data.id} />
                        )}
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
                            onBlur={(e) => { handleSlugBlur(); e.target.style.borderColor = '#e5e3df'; }}
                        />
                        <CharacterCount
                            value={data.title}
                            max={validation.MAX_TITLE_LENGTH}
                        />
                        {errors.title && (
                            <div className="text-red-600">{errors.title}</div>
                        )}
                    </div>

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
                        <CharacterCount
                            value={data.slug}
                            max={validation.MAX_SLUG_LENGTH}
                        />
                        {errors.slug && (
                            <div className="text-red-600">{errors.slug}</div>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="excerpt"
                            className="block font-medium"
                            style={{ color: '#3d3d3d' }}
                        >
                            Excerpt
                        </label>
                        <TextareaAutosize
                            id="excerpt"
                            name="excerpt"
                            value={data.excerpt}
                            onChange={(e) => setData("excerpt", e.target.value)}
                            minRows={2}
                            maxRows={5}
                            className="mt-1 block w-full border rounded-md shadow-sm p-2.5 text-base focus:outline-none focus:ring-2 transition"
                            style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                            onFocus={(e) => e.target.style.borderColor = '#7a9d7a'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e3df'}
                            placeholder="Short summary for project listings"
                        />
                        <CharacterCount
                            value={data.excerpt}
                            max={500}
                        />
                        {errors.excerpt && (
                            <div className="text-red-600">{errors.excerpt}</div>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="block font-medium"
                            style={{ color: '#3d3d3d' }}
                        >
                            Description
                        </label>
                        <TextareaAutosize
                            id="description"
                            name="description"
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            minRows={4}
                            maxRows={20}
                            className="mt-1 block w-full border rounded-md shadow-sm p-2.5 text-base focus:outline-none focus:ring-2 transition"
                            style={{ borderColor: '#e5e3df', color: '#3d3d3d' }}
                            onFocus={(e) => e.target.style.borderColor = '#7a9d7a'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e3df'}
                        />
                        <CharacterCount
                            value={data.description}
                            max={validation.MAX_DESCRIPTION_LENGTH}
                        />
                        {errors.description && (
                            <div className="text-red-600">
                                {errors.description}
                            </div>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="tags"
                            className="block font-medium"
                            style={{ color: '#3d3d3d' }}
                        >
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
                        {errors.tags && (
                            <div className="text-red-600 text-sm mt-1">{errors.tags}</div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="text-white px-6 py-2.5 rounded-md hover:opacity-90 transition disabled:opacity-50"
                            style={{ backgroundColor: '#7a9d7a' }}
                        >
                            {data.id ? "Update" : "Create"} Project
                        </button>

                        {data.id && (
                            <DangerButton
                                type="button"
                                onClick={confirmDeletion}
                            >
                                Delete Project
                            </DangerButton>
                        )}
                    </div>
                </form>
            </div>

            <Modal show={confirmingDeletion} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium" style={{ color: '#3d3d3d' }}>
                        Are you sure you want to delete this project?
                    </h2>

                    <p className="mt-1 text-sm" style={{ color: '#7a7a7a' }}>
                        Once this project is deleted, all of its data will be
                        permanently removed. This action cannot be undone.
                    </p>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton onClick={deleteProject} disabled={processing}>
                            Delete Project
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
