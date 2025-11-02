import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { Leaf } from 'lucide-react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-white pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/" className="text-3xl font-bold flex items-center gap-2" style={{ color: '#3d3d3d' }}>
                    <Leaf style={{ color: '#7a9d7a' }} size={36} />
                    <span>Sabrina Markon</span>
                </Link>
            </div>

            <div className="mt-8 w-full overflow-hidden bg-white px-8 py-6 shadow-lg sm:max-w-md rounded-2xl" style={{ border: '1px solid #e5e3df' }}>
                {children}
            </div>

            {/* Footer */}
            <footer className="mt-8 text-center" style={{ color: '#7a7a7a' }}>
                <p className="text-sm">© 2025 Sabrina Markon. Crafted with care and code 💚</p>
            </footer>
        </div>
    );
}
