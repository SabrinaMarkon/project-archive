import { Head } from "@inertiajs/react";
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import ContactSection from '@/Components/Portfolio/ContactSection';

export default function Index() {
    return (
        <PortfolioLayout>
            <Head title="Resume - Sabrina Markon" />

            {/* Projects Header */}
            <section className="pt-32 pb-12 px-6 bg-white">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#2d2d2d' }}>
                        Resume
                    </h1>
                    <p className="text-xl max-w-2xl mx-auto" style={{ color: '#5a5a5a' }}>
                        My resume showcasing my skills, experience, and education.
                    </p>
                </div>
            </section>

            {/* Resume Content */}
            <section className="py-12 pb-24 px-6" style={{ backgroundColor: '#d4e5c8' }}>
                <div className="max-w-6xl mx-auto">

                </div>
            </section>

            <ContactSection />
        </PortfolioLayout>
    );
}
