import { Head } from '@inertiajs/react';
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import HeroSection from '@/Components/Portfolio/HeroSection';
import FeaturedProjects from '@/Components/Portfolio/FeaturedProjects';
import WritingSection from '@/Components/Portfolio/WritingSection';
import AboutSection from '@/Components/Portfolio/AboutSection';
import ContactSection from '@/Components/Portfolio/ContactSection';
import { Project } from '@/types/project';
import { Post } from '@/types/post';

interface WelcomeProps {
    projects: Project[];
    posts: Post[];
}

export default function Welcome({ projects, posts }: WelcomeProps) {
    return (
        <PortfolioLayout>
            <Head title="Sabrina Markon - Developer & Writer" />
            <HeroSection />
            <FeaturedProjects projects={projects} limit={3} />
            <WritingSection posts={posts} limit={3}  />
            <AboutSection />
            <ContactSection />
        </PortfolioLayout>
    );
}
