import { FormEventHandler, useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import TextInput from './TextInput';
import InputError from './InputError';

const DISMISSAL_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
const SHOW_DELAY = 30000; // 30 seconds

interface NewsletterModalProps {
    externalShow?: boolean;
    onExternalClose?: () => void;
}

export default function NewsletterModal({ externalShow = false, onExternalClose }: NewsletterModalProps = {}) {
    const [internalShow, setInternalShow] = useState(false);
    const { flash } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    useEffect(() => {
        // Check if user has already subscribed
        const hasSubscribed = localStorage.getItem('newsletter_subscribed') === 'true';
        if (hasSubscribed) {
            return;
        }

        // Check if user has dismissed the modal recently
        const dismissedAt = localStorage.getItem('newsletter_dismissed_at');
        if (dismissedAt) {
            const dismissedTime = new Date(dismissedAt).getTime();
            const now = new Date().getTime();
            if (now - dismissedTime < DISMISSAL_DURATION) {
                return; // Don't show if dismissed within last 30 days
            }
        }

        // Show modal after delay
        const timer = setTimeout(() => {
            setInternalShow(true);
        }, SHOW_DELAY);

        return () => clearTimeout(timer);
    }, []);

    // Auto-close modal after successful subscription
    useEffect(() => {
        if (flash?.success) {
            const timer = setTimeout(() => {
                setInternalShow(false);
                if (onExternalClose) {
                    onExternalClose();
                }
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    const show = externalShow || internalShow;

    const handleClose = () => {
        setInternalShow(false);
        if (onExternalClose) {
            onExternalClose();
        }
        localStorage.setItem('newsletter_dismissed_at', new Date().toISOString());
    };

    const handleMaybeLater = () => {
        handleClose();
    };

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

    return (
        <Modal show={show} onClose={handleClose} maxWidth="md">
            <div className="p-6">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-3">📬</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Want Developer Tips & Tutorials?
                    </h2>
                    <p className="text-gray-600">
                        Subscribe to get updates about new projects, courses, and insights delivered to your inbox.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mb-4">
                    <TextInput
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="Enter your email address"
                        required
                        disabled={processing}
                        className="w-full mb-4"
                    />

                    {errors.email && <InputError message={errors.email} className="mb-4" />}

                    {flash?.success && (
                        <p className="mb-4 text-sm text-center text-green-600">
                            {flash.success}
                        </p>
                    )}

                    {flash?.error && (
                        <p className="mb-4 text-sm text-center text-red-600">
                            {flash.error}
                        </p>
                    )}

                    <div className="flex gap-3">
                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                            className="flex-1 justify-center"
                        >
                            {processing ? 'Subscribing...' : 'Subscribe'}
                        </PrimaryButton>
                    </div>
                </form>

                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={handleMaybeLater}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </Modal>
    );
}
