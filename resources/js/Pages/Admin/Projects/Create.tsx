import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CharacterCount from "@/Components/CharacterCount";
import DashboardLayout from "@/Layouts/DashboardLayout";
import TextareaAutosize from "react-textarea-autosize";
import * as validation from "@/constants/validation";
import { formatSlug } from "@/utils/validation";
import { Head, useForm } from "@inertiajs/react";
import { Project } from "@/types/project";

Create.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default function Create({ project }: { project: Project | null }) {
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    const { data, setData, post, put, processing, errors } = useForm({
        id: project?.id ?? null, // If project exists, use its ID, otherwise null for new
        title: project?.title ?? "",
        slug: project?.slug ?? "",
        description: project?.description ?? "",
    });

    // Submit handler for creating or updating a project
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Check if it's an edit (update) and the slug hasn't changed
        if (data.id) {

            console.log(project?.slug + " DUH " + data.slug)
            // If `slug` is the same as the existing slug, just update the project without changing the URL
            // const updateUrl =
            //     data.slug === project?.slug
            //         ? `/admin/projects/${project?.slug}`
            //         : `/admin/projects/${data.slug}`;

            const updateUrl = `/admin/projects`;
            // Use PUT request with the correct URL (slug or existing slug)
            put(updateUrl);
        } else {
            // Otherwise, create a new project
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

    useEffect(() => {
        if (project) {
            // If the project exists, populate form with existing data
            setData({
                id: project.id,
                title: project.title,
                slug: project.slug,
                description: project.description,
            });
        }
    }, [project]); // Runs whenever the `project` prop changes

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {data.id ? "Edit " : "Create "}
                    Project
                </h2>
            }
        >
            <Head title={data.id ? "Edit Project" : "Create Project"} />

            <div className="py-4 text-gray-900 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                <form onSubmit={submit} className="space-y-6 max-w-xl">
                    <div>
                        {data.id && (
                            <input type="hidden" name="id" value={data.id} />
                        )}
                        <label htmlFor="title" className="block font-medium">
                            Title
                        </label>
                        <input
                            id="title"
                            value={data.title}
                            onChange={handleTitleChange}
                            onBlur={handleSlugBlur}
                            className="w-full border rounded p-2"
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
                        <label htmlFor="slug" className="block font-medium">
                            Slug
                        </label>
                        <input
                            id="slug"
                            value={data.slug}
                            onChange={handleSlugChange}
                            onBlur={handleSlugBlur}
                            className="w-full border rounded p-2"
                        />
                        <button
                            type="button"
                            className="text-sm text-blue-600 underline"
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
                            htmlFor="description"
                            className="block font-medium"
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
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-base focus:ring focus:ring-indigo-200"
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

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        {data.id ? "Update" : "Create"} Project
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
