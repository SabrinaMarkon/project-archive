


import { CheckCircle2 } from 'lucide-react';
import {
    AWSIcon,
    CSS3Icon,
    DockerIcon,
    GitIcon,
    GraphQLIcon,
    HTML5Icon,
    InertiaIcon,
    JavaScriptIcon,
    LaravelIcon,
    Magento2Icon,
    MariaDBIcon,
    MySQLIcon,
    PHPIcon,
    ReactIcon,
    TypeScriptIcon,
    ViteIcon,
    VSCodeIcon,
    VueIcon
} from '@/Components/Icons';

export default function AboutSection() {
    return (
        <section id="about" className="py-24 px-6" style={{ backgroundColor: '#f4e4c1' }}>
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-5xl font-bold mb-6" style={{ color: '#2d2d2d' }}>About Me</h2>
                        <div className="space-y-4 text-lg leading-relaxed" style={{ color: '#5a5a5a' }}>
                            <p>
                                I'm a full-stack developer specializing in Laravel and React, building
                                scalable web applications with modern architecture patterns. I focus on
                                writing clean, testable code and creating systems that are maintainable
                                from day one.
                            </p>
                            <p>
                                My experience spans both greenfield projects and complex existing
                                codebases, giving me a practical understanding of what works in real-world
                                production environments. I write about development insights, debugging
                                strategies, and lessons learned along the way.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-square rounded-2xl flex items-center justify-center shadow-lg p-12" style={{ backgroundColor: '#ffffff' }}>
                            <div className="flex flex-col justify-between w-full h-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 mx-auto max-w-fit">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} style={{ color: '#658965' }} />
                                        <span className="font-medium text-sm" style={{ color: '#3d3d3d' }}>Full-Stack Development</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} style={{ color: '#658965' }} />
                                        <span className="font-medium text-sm" style={{ color: '#3d3d3d' }}>Laravel & React</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} style={{ color: '#658965' }} />
                                        <span className="font-medium text-sm" style={{ color: '#3d3d3d' }}>API Development</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} style={{ color: '#658965' }} />
                                        <span className="font-medium text-sm" style={{ color: '#3d3d3d' }}>Database Design</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} style={{ color: '#658965' }} />
                                        <span className="font-medium text-sm" style={{ color: '#3d3d3d' }}>Legacy Modernization</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} style={{ color: '#658965' }} />
                                        <span className="font-medium text-sm" style={{ color: '#3d3d3d' }}>Responsive Design</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} style={{ color: '#658965' }} />
                                        <span className="font-medium text-sm" style={{ color: '#3d3d3d' }}>Technical Writing</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} style={{ color: '#658965' }} />
                                        <span className="font-medium text-sm" style={{ color: '#3d3d3d' }}>E-Commerce Development</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} style={{ color: '#658965' }} />
                                        <span className="font-medium text-sm" style={{ color: '#3d3d3d' }}>Third-Party Integrations</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={18} style={{ color: '#658965' }} />
                                        <span className="font-medium text-sm" style={{ color: '#3d3d3d' }}>Dev Tutorials</span>
                                    </div>
                                </div>

                                <div className="pt-8 hidden lg:block">
                                    <div className="grid grid-cols-5 gap-4 items-center justify-items-center">
                                        <AWSIcon size={44} />
                                        <CSS3Icon size={44} />
                                        <DockerIcon size={44} />
                                        <GitIcon size={44} />
                                        <GraphQLIcon size={44} />
                                        <HTML5Icon size={44} />
                                        <InertiaIcon size={44} />
                                        <JavaScriptIcon size={44} />
                                        <LaravelIcon size={44} />
                                        <Magento2Icon size={44} />
                                        <MariaDBIcon size={44} />
                                        <MySQLIcon size={44} />
                                        <PHPIcon size={44} />
                                        <ReactIcon size={44} />
                                        <TypeScriptIcon size={44} />
                                        <ViteIcon size={44} />
                                        <VSCodeIcon size={44} />
                                        <VueIcon size={44} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
