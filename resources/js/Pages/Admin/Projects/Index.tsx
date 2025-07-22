import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import { Project } from "@/types/project";

Index.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default function Index({ projects }: { projects: Project[] }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Project List
                </h2>
            }
        >
            <Head title="Project List" />

            <div className="py-4 text-gray-900 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                <ul>
                    {projects.map((project) => (
                        <li key={project.id}>
                            <Link
                                href={`/admin/projects/${project.slug}`}
                                className="text-blue-600 underline hover:text-blue-800"
                            >
                                {project.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </AuthenticatedLayout>
    );
}
