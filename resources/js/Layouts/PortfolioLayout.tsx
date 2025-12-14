import { useState, PropsWithChildren } from 'react';
import { Menu, X, Leaf, User, LogOut, Settings } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import NewsletterModal from '@/Components/NewsletterModal';
import NewsletterSignup from '@/Components/NewsletterSignup';
import Dropdown from '@/Components/Dropdown';

export default function PortfolioLayout({ children }: PropsWithChildren) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showNewsletterModal, setShowNewsletterModal] = useState(false);
    const { auth } = usePage().props as { auth: { user: { name: string; is_admin: boolean } | null } };

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b z-50 shadow-sm" style={{ borderColor: '#e5e3df' }}>
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-2xl font-bold flex items-center gap-2" style={{ color: '#3d3d3d' }}>
                            <Leaf style={{ color: '#7a9d7a' }} size={28} />
                            Sabrina Markon
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/#home" className="font-medium transition hover:opacity-70" style={{ color: '#5a5a5a' }}>Home</Link>
                            <Link href="/projects" className="font-medium transition hover:opacity-70" style={{ color: '#5a5a5a' }}>Projects</Link>
                            <Link href="/posts" className="font-medium transition hover:opacity-70" style={{ color: '#5a5a5a' }}>Writing</Link>
                            <Link href="/courses" className="font-medium transition hover:opacity-70" style={{ color: '#5a5a5a' }}>Courses</Link>
                            <Link href="/#about" className="font-medium transition hover:opacity-70" style={{ color: '#5a5a5a' }}>About</Link>
                            <Link href="/resume" className="font-medium transition hover:opacity-70" style={{ color: '#5a5a5a' }}>CV</Link>
                            <button
                                onClick={() => setShowNewsletterModal(true)}
                                className="font-medium transition hover:opacity-70"
                                style={{ color: '#5a5a5a' }}
                            >
                                Newsletter
                            </button>
                            {auth.user ? (
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center gap-2 px-4 py-2 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300" style={{ backgroundColor: '#7a9d7a' }}>
                                            <User size={16} />
                                            {auth.user.name}
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        {auth.user.is_admin && (
                                            <Dropdown.Link href="/dashboard">
                                                Admin Dashboard
                                            </Dropdown.Link>
                                        )}
                                        <Dropdown.Link href="/dashboard/courses">
                                            My Courses
                                        </Dropdown.Link>
                                        <Dropdown.Link href="/profile">
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link href="/logout" method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            ) : (
                                <>
                                    <Link href="/login" className="font-medium transition hover:opacity-70" style={{ color: '#5a5a5a' }}>Login</Link>
                                    <Link href="/register" className="px-5 py-2.5 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300" style={{ backgroundColor: '#7a9d7a' }}>
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden"
                            style={{ color: '#5a5a5a' }}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <div className="md:hidden pt-4 pb-2 space-y-2">
                            <Link href="/#home" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>Home</Link>
                            <Link href="/projects" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>Projects</Link>
                            <Link href="/posts" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>Writing</Link>
                            <Link href="/courses" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>Courses</Link>
                            <Link href="/#about" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>About</Link>
                            <Link href="/resume" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>CV</Link>
                            <button
                                onClick={() => {
                                    setShowNewsletterModal(true);
                                    setMobileMenuOpen(false);
                                }}
                                className="block py-2 font-medium text-left w-full"
                                style={{ color: '#5a5a5a' }}
                            >
                                Newsletter
                            </button>
                            {auth.user ? (
                                <>
                                    {auth.user.is_admin && (
                                        <Link href="/dashboard" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <Link href="/dashboard/courses" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>
                                        My Courses
                                    </Link>
                                    <Link href="/profile" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>
                                        Profile ({auth.user.name})
                                    </Link>
                                    <Link href="/logout" method="post" as="button" className="block py-2 font-medium text-left w-full" style={{ color: '#5a5a5a' }}>
                                        Log Out
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>Login</Link>
                                    <Link href="/register" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>Sign Up</Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Newsletter Signup Footer */}
            <NewsletterSignup variant="footer" />

            {/* Footer */}
            <footer className="py-8 px-6 bg-white">
                <div className="max-w-6xl mx-auto border-t pt-8" style={{ borderColor: '#e5e3df' }}>
                    <div className="text-center" style={{ color: '#7a7a7a' }}>
                        <p>© 2025 Sabrina Markon. Crafted with care and code 💚</p>
                    </div>
                </div>
            </footer>

            {/* Newsletter Modal */}
            <NewsletterModal
                externalShow={showNewsletterModal}
                onExternalClose={() => setShowNewsletterModal(false)}
            />
        </div>
    );
}
