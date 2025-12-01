import { FormEventHandler } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import PrimaryButton from './PrimaryButton';
import TextInput from './TextInput';
import InputError from './InputError';

interface NewsletterSignupProps {
    variant?: 'footer' | 'inline';
}

export default function NewsletterSignup({ variant = 'footer' }: NewsletterSignupProps) {
    const { flash } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/newsletter/subscribe', {
            preserveScroll: true,
            onFinish: () => {
                setData('email', '');
            },
            onSuccess: () => {
                localStorage.setItem('newsletter_subscribed', 'true');
                localStorage.setItem('newsletter_subscribed_date', new Date().toISOString());
            },
        });
    };

    if (variant === 'footer') {
        return (
            <div className="bg-gray-800 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Subscribe to My Newsletter</h3>
                        <p className="text-gray-300 text-sm mb-4">
                            Get updates about new tutorials, projects, and courses delivered to your inbox.
                        </p>
                        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                            <div className="flex gap-2">
                                <TextInput
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    disabled={processing}
                                    className="flex-1 text-gray-900"
                                />
                                <PrimaryButton type="submit" disabled={processing}>
                                    {processing ? 'Subscribing...' : 'Subscribe'}
                                </PrimaryButton>
                            </div>
                            {errors.email && <InputError message={errors.email} className="mt-2" />}
                            {flash?.success && (
                                <p className="mt-2 text-sm text-green-400">
                                    {flash.success}
                                </p>
                            )}
                            {flash?.error && (
                                <p className="mt-2 text-sm text-red-400">
                                    {flash.error}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Inline variant for use in content areas
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-6">
            <h4 className="text-lg font-semibold mb-2">Subscribe for Updates</h4>
            <p className="text-gray-600 text-sm mb-4">
                Get notified about new tutorials, projects, and courses.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <TextInput
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={processing}
                    className="flex-1"
                />
                <PrimaryButton type="submit" disabled={processing}>
                    {processing ? 'Subscribing...' : 'Subscribe'}
                </PrimaryButton>
            </form>
            {errors.email && <InputError message={errors.email} className="mt-2" />}
            {flash?.success && (
                <p className="mt-2 text-sm text-green-600">
                    {flash.success}
                </p>
            )}
            {flash?.error && (
                <p className="mt-2 text-sm text-red-600">
                    {flash.error}
                </p>
            )}
        </div>
    );
}
