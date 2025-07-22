import React from "react";
import { Head, Link } from "@inertiajs/react";
import { Project } from "@/types/project";

export default function Index({ projects }: { projects: Project[] }) {
    return (
        <>
            <Head title="Projects" />

            <h1 className="text-2xl font-bold mb-4">Projects</h1>

            <ul>
                {projects.map((project) => (
                    <li key={project.id}>
                        <Link
                            href={`/projects/${project.slug}`}
                            className="text-blue-600 underline hover:text-blue-800"
                        >
                            {project.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    );
}
