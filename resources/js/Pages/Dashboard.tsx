import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import { Plus, List, Leaf } from "lucide-react";

Dashboard.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight" style={{ color: '#3d3d3d' }}>
                    Dashboard
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div>
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold mb-2" style={{ color: '#3d3d3d' }}>
                                Welcome to Project Archive Admin
                            </h3>
                            <p style={{ color: '#7a7a7a' }}>
                                Manage your portfolio projects from here.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            <Link
                                href="/admin/projects/create"
                                className="flex items-center gap-4 p-6 rounded-lg border transition hover:shadow-md"
                                style={{ borderColor: '#e5e3df' }}
                            >
                                <div className="p-3 rounded-full" style={{ backgroundColor: '#7a9d7a' }}>
                                    <Plus size={24} style={{ color: 'white' }} />
                                </div>
                                <div>
                                    <h4 className="font-semibold" style={{ color: '#3d3d3d' }}>
                                        Create New Project
                                    </h4>
                                    <p className="text-sm" style={{ color: '#7a7a7a' }}>
                                        Add a new project to your portfolio
                                    </p>
                                </div>
                            </Link>

                            <Link
                                href="/admin/projects"
                                className="flex items-center gap-4 p-6 rounded-lg border transition hover:shadow-md"
                                style={{ borderColor: '#e5e3df' }}
                            >
                                <div className="p-3 rounded-full" style={{ backgroundColor: '#7a9d7a' }}>
                                    <List size={24} style={{ color: 'white' }} />
                                </div>
                                <div>
                                    <h4 className="font-semibold" style={{ color: '#3d3d3d' }}>
                                        Manage Projects
                                    </h4>
                                    <p className="text-sm" style={{ color: '#7a7a7a' }}>
                                        View, edit, or delete existing projects
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
