import { Head, Link } from '@inertiajs/react';

export default function Confirmed({ success, message }: { success: boolean; message: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#f9faf8' }}>
            <Head title={success ? 'Subscription Confirmed!' : 'Confirmation Failed'} />

            <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden" style={{ borderColor: '#e5e3df', borderWidth: '1px' }}>
                <div className="p-8 text-center">
                    <div className="text-6xl mb-4">
                        {success ? '✅' : '❌'}
                    </div>

                    <h1 className="text-2xl font-bold mb-4" style={{ color: '#3d3d3d' }}>
                        {success ? 'Subscription Confirmed!' : 'Confirmation Failed'}
                    </h1>

                    <p className="text-base mb-8" style={{ color: '#7a7a7a' }}>
                        {message}
                    </p>

                    <Link
                        href="/"
                        className="inline-block px-6 py-3 text-white rounded-md font-medium transition hover:opacity-90"
                        style={{ backgroundColor: '#7a9d7a' }}
                    >
                        Return to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
