import { Head } from '@inertiajs/react';
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import HeroSection from '@/Components/Portfolio/HeroSection';
import FeaturedProjects from '@/Components/Portfolio/FeaturedProjects';
import WritingSection from '@/Components/Portfolio/WritingSection';
import FeaturedCourses from '@/Components/Portfolio/FeaturedCourses';
import AboutSection from '@/Components/Portfolio/AboutSection';
import ContactSection from '@/Components/Portfolio/ContactSection';
import { Project } from '@/types/project';
import { Post } from '@/types/post';

interface Course {
    id: number;
    title: string;
    description: string | null;
    price: string;
    payment_type: 'one_time' | 'monthly' | 'annual';
    modules_count: number;
}

interface WelcomeProps {
    projects: Project[];
    posts: Post[];
    courses: Course[];
}

export default function Welcome({ projects, posts, courses }: WelcomeProps) {
    return (
        <PortfolioLayout>
            <Head title="Sabrina Markon - Developer & Writer" />
            <HeroSection />
            <FeaturedProjects projects={projects} limit={3} />
            <WritingSection posts={posts} limit={3}  />
            <FeaturedCourses courses={courses} limit={3} />
            <AboutSection />
            <ContactSection />
        </PortfolioLayout>
    );
}
