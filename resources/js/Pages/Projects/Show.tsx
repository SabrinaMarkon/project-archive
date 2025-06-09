import React from 'react';
import { Head } from '@inertiajs/react';
import { Project } from '@/types/project';

export default function Show({ project }: { project: Project }) {
    return (
        <>
            <Head title={project.title} />

            <h1 className="text-2xl font-bold mb-4">{project.title}</h1>
            <p>{project.description}</p>
        </>
    );
}
