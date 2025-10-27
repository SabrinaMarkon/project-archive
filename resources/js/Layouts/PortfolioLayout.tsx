import { useState, PropsWithChildren } from 'react';
import { Menu, X, Leaf } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function PortfolioLayout({ children }: PropsWithChildren) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                            <Link href="/#writing" className="font-medium transition hover:opacity-70" style={{ color: '#5a5a5a' }}>Writing</Link>
                            <Link href="/#about" className="font-medium transition hover:opacity-70" style={{ color: '#5a5a5a' }}>About</Link>
                            <Link href="/#contact" className="px-5 py-2.5 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300" style={{ backgroundColor: '#7a9d7a' }}>
                                Contact
                            </Link>
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
                            <Link href="/#writing" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>Writing</Link>
                            <Link href="/#about" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>About</Link>
                            <Link href="/#contact" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>Contact</Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Footer */}
            <footer className="py-8 px-6 bg-white">
                <div className="max-w-6xl mx-auto border-t pt-8" style={{ borderColor: '#e5e3df' }}>
                    <div className="text-center" style={{ color: '#7a7a7a' }}>
                        <p>© 2024 Sabrina Markon. Crafted with care and code.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
