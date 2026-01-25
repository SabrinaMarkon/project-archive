import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DangerButton from "@/Components/DangerButton";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import { Head, Link, router } from "@inertiajs/react";
import { Project } from "@/types/project";
import { ExternalLink, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";

Index.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default function Index({ projects }: { projects: Project[] }) {
    const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    const toggleExpand = (projectId: number) => {
        setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
    };

    const confirmDeletion = (project: Project) => {
        setProjectToDelete(project);
        setConfirmingDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
        setProjectToDelete(null);
    };

    const deleteProject = () => {
        if (projectToDelete) {
            router.delete(`/admin/projects/${projectToDelete.slug}`, {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight" style={{ color: '#3d3d3d' }}>
                    Project List
                </h2>
            }
        >
            <Head title="Project List" />

            <div className="py-4 px-6 text-gray-900 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                <div className="space-y-2">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            style={{ borderColor: '#e5e3df' }}
                        >
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => toggleExpand(project.id)}
                                    className="flex items-center gap-2 text-left flex-1 font-medium hover:opacity-70 transition"
                                    style={{ color: '#3d3d3d' }}
                                >
                                    {expandedProjectId === project.id ? (
                                        <ChevronDown size={20} style={{ color: '#7a9d7a' }} />
                                    ) : (
                                        <ChevronRight size={20} style={{ color: '#7a9d7a' }} />
                                    )}
                                    <span>{project.title}</span>
                                </button>

                                <div className="flex items-center gap-2">
                                    <a
                                        href={`/projects/${project.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white rounded-md transition hover:opacity-90"
                                        style={{ backgroundColor: '#7a9d7a' }}
                                        title="View project"
                                    >
                                        <ExternalLink size={16} />
                                        View
                                    </a>

                                    <Link
                                        href={`/admin/projects/${project.slug}`}
                                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white rounded-md transition hover:opacity-90"
                                        style={{ backgroundColor: '#5a8a5a' }}
                                        title="Update project"
                                    >
                                        <Edit size={16} />
                                        Update
                                    </Link>

                                    <button
                                        onClick={() => confirmDeletion(project)}
                                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md transition hover:bg-red-700"
                                        title="Delete project"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {expandedProjectId === project.id && (
                                <div
                                    className="mt-3 pt-3 border-t"
                                    style={{ borderColor: '#e5e3df' }}
                                >
                                    <div className="text-sm mb-3" style={{ color: '#5a5a5a' }}>
                                        {project.description || <em>No description available</em>}
                                    </div>
                                    {project.tags && project.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-xs font-medium" style={{ color: '#7a7a7a' }}>Tags:</span>
                                            {project.tags.map((tag) => (
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
                    ))}

                    {projects.length === 0 && (
                        <div className="text-center py-8" style={{ color: '#7a7a7a' }}>
                            <p>No projects found. Create your first project!</p>
                            <Link
                                href={route('admin.projects.create')}
                                className="inline-block mt-4 px-5 py-2.5 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                                style={{ backgroundColor: '#7a9d7a' }}
                            >
                                Create Project
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={confirmingDeletion} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium" style={{ color: '#3d3d3d' }}>
                        Are you sure you want to delete this project?
                    </h2>

                    <p className="mt-1 text-sm" style={{ color: '#7a7a7a' }}>
                        Once deleted, "{projectToDelete?.title}" will be permanently removed. This action cannot be undone.
                    </p>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton onClick={deleteProject}>
                            Delete Project
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
