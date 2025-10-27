import React from 'react';
import { Code2 } from 'lucide-react';

export default function AboutSection() {
    return (
        <section id="about" className="py-24 px-6" style={{ backgroundColor: '#f4e4c1' }}>
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-5xl font-bold mb-6" style={{ color: '#2d2d2d' }}>About Me</h2>
                        <div className="space-y-4 text-lg leading-relaxed" style={{ color: '#5a5a5a' }}>
                            <p>
                                I'm a developer with a passion for building clean, efficient web applications.
                                My work focuses on full-stack development with Laravel and React, creating
                                systems that are both powerful and maintainable.
                            </p>
                            <p>
                                When I'm not coding, I write about software development, share insights on
                                architecture patterns, and explore new technologies. I believe in learning in
                                public and contributing to the development community.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-square rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#ffffff' }}>
                            <div className="text-center p-8">
                                <Code2 size={64} className="mx-auto mb-4" style={{ color: '#658965' }} />
                                <p className="font-semibold text-lg" style={{ color: '#3d3d3d' }}>Building the web, one line at a time</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
