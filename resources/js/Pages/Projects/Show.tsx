import React from 'react';
import { Head } from '@inertiajs/react';

interface Project {
    id: number;
    title: string;
    slug: string;
    description: string;
}

export default function Show({ project }: { project: Project }) {
    return (
        <>
            <Head title={project.title} />

            <h1 className="text-2xl font-bold mb-4">{project.title}</h1>
            <p>{project.description}</p>
        </>
    );
}
