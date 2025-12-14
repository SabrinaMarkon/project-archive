import { Head, Link, router } from '@inertiajs/react';
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import { CreditCard, DollarSign, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface Course {
    id: number;
    title: string;
    description: string | null;
    price: number;
    stripe_enabled: boolean;
    paypal_enabled: boolean;
}

interface Props {
    course: Course;
}

export default function SelectPayment({ course }: Props) {
    const [processing, setProcessing] = useState(false);

    const handleCheckout = (method: 'stripe' | 'paypal') => {
        setProcessing(true);
        router.post(
            route('courses.checkout', course.id),
            { payment_method: method },
            {
                onError: () => setProcessing(false),
            }
        );
    };

    const enabledMethods = [
        course.stripe_enabled && 'stripe',
        course.paypal_enabled && 'paypal',
    ].filter(Boolean);

    // If only one method enabled, redirect automatically
    if (enabledMethods.length === 1 && !processing) {
        handleCheckout(enabledMethods[0] as 'stripe' | 'paypal');
        return (
            <PortfolioLayout>
                <Head title={`Checkout - ${course.title}`} />
                <div className="flex min-h-screen items-center justify-center">
                    <p className="text-lg">Redirecting to checkout...</p>
                </div>
            </PortfolioLayout>
        );
    }

    return (
        <PortfolioLayout>
            <Head title={`Checkout - ${course.title}`} />

            <section className="px-6 py-32" style={{ backgroundColor: '#d8e5b8' }}>
                <div className="mx-auto max-w-2xl">
                    <Link
                        href={`/courses/${course.id}`}
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium hover:underline"
                        style={{ color: '#658965' }}
                    >
                        <ArrowLeft size={16} />
                        Back to Course
                    </Link>

                    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
                        <div className="border-b p-8" style={{ borderColor: '#e5e3df' }}>
                            <h1 className="mb-2 text-3xl font-bold" style={{ color: '#2d2d2d' }}>
                                Complete Your Purchase
                            </h1>
                            <p className="text-lg" style={{ color: '#5a5a5a' }}>
                                {course.title}
                            </p>
                            <p className="mt-4 text-3xl font-bold" style={{ color: '#658965' }}>
                                ${course.price}
                            </p>
                        </div>

                        <div className="p-8">
                            <h2 className="mb-6 text-xl font-semibold" style={{ color: '#2d2d2d' }}>
                                Select Payment Method
                            </h2>

                            <div className="space-y-4">
                                {course.stripe_enabled && (
                                    <button
                                        onClick={() => handleCheckout('stripe')}
                                        disabled={processing}
                                        className="flex w-full items-center justify-between rounded-xl border-2 p-6 transition hover:shadow-lg disabled:opacity-50"
                                        style={{
                                            borderColor: '#635bff',
                                            backgroundColor: '#fafafa',
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="flex h-12 w-12 items-center justify-center rounded-lg"
                                                style={{ backgroundColor: '#635bff' }}
                                            >
                                                <CreditCard className="text-white" size={24} />
                                            </div>
                                            <div className="text-left">
                                                <p
                                                    className="font-semibold"
                                                    style={{ color: '#2d2d2d' }}
                                                >
                                                    Pay with Stripe
                                                </p>
                                                <p
                                                    className="text-sm"
                                                    style={{ color: '#7a7a7a' }}
                                                >
                                                    Credit card, debit card, or digital wallet
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium" style={{ color: '#635bff' }}>
                                            Continue →
                                        </div>
                                    </button>
                                )}

                                {course.paypal_enabled && (
                                    <button
                                        onClick={() => handleCheckout('paypal')}
                                        disabled={processing}
                                        className="flex w-full items-center justify-between rounded-xl border-2 p-6 transition hover:shadow-lg disabled:opacity-50"
                                        style={{
                                            borderColor: '#0070ba',
                                            backgroundColor: '#fafafa',
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="flex h-12 w-12 items-center justify-center rounded-lg"
                                                style={{ backgroundColor: '#0070ba' }}
                                            >
                                                <DollarSign className="text-white" size={24} />
                                            </div>
                                            <div className="text-left">
                                                <p
                                                    className="font-semibold"
                                                    style={{ color: '#2d2d2d' }}
                                                >
                                                    Pay with PayPal
                                                </p>
                                                <p
                                                    className="text-sm"
                                                    style={{ color: '#7a7a7a' }}
                                                >
                                                    PayPal balance or linked payment methods
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium" style={{ color: '#0070ba' }}>
                                            Continue →
                                        </div>
                                    </button>
                                )}

                                {!course.stripe_enabled && !course.paypal_enabled && (
                                    <div className="rounded-lg bg-red-50 p-6 text-center">
                                        <p className="font-semibold text-red-900">
                                            Payment methods not configured
                                        </p>
                                        <p className="mt-2 text-sm text-red-700">
                                            Please contact support to complete your purchase.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-sm" style={{ color: '#5a5a5a' }}>
                        Your payment is secure and encrypted. You'll get instant access to all course
                        materials.
                    </p>
                </div>
            </section>
        </PortfolioLayout>
    );
}
