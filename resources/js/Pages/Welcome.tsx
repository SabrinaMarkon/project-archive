import { Head } from '@inertiajs/react';
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import HeroSection from '@/Components/Portfolio/HeroSection';
import FeaturedProjects from '@/Components/Portfolio/FeaturedProjects';
import WritingSection from '@/Components/Portfolio/WritingSection';
import AboutSection from '@/Components/Portfolio/AboutSection';
import ContactSection from '@/Components/Portfolio/ContactSection';

interface Project {
    slug: string;
    title: string;
    description: string | null;
}

interface WelcomeProps {
    projects: Project[];
}

export default function Welcome({ projects }: WelcomeProps) {
    return (
        <PortfolioLayout>
            <Head title="Sabrina Markon - Developer & Writer" />
            <HeroSection />
            <FeaturedProjects projects={projects} limit={3} />
            <WritingSection />
            <AboutSection />
            <ContactSection />
        </PortfolioLayout>
    );
}
