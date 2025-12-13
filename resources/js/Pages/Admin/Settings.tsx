import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { FormEventHandler } from 'react';
import { CreditCard, DollarSign, Shield } from 'lucide-react';

interface Props {
    settings: {
        stripe_public_key: string;
        stripe_secret_key: string;
        stripe_webhook_secret: string;
        paypal_client_id: string;
        paypal_secret: string;
        stripe_enabled: boolean;
        paypal_enabled: boolean;
    };
}

export default function Settings({ settings }: Props) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        stripe_public_key: settings.stripe_public_key || '',
        stripe_secret_key: settings.stripe_secret_key || '',
        stripe_webhook_secret: settings.stripe_webhook_secret || '',
        paypal_client_id: settings.paypal_client_id || '',
        paypal_secret: settings.paypal_secret || '',
        stripe_enabled: settings.stripe_enabled,
        paypal_enabled: settings.paypal_enabled,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.settings.update'));
    };

    return (
        <>
            <Head title="Settings" />

            <div className="max-w-4xl">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold" style={{ color: '#2d2d2d' }}>
                        Payment Settings
                    </h2>
                    <p className="mt-2" style={{ color: '#7a7a7a' }}>
                        Configure payment gateways for course purchases
                    </p>
                </div>

                {recentlySuccessful && (
                    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
                        <p className="font-medium" style={{ color: '#2e7d32' }}>
                            Settings updated successfully!
                        </p>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-8">
                    {/* Stripe Settings */}
                    <div className="bg-white rounded-xl p-8 shadow-md" style={{ borderColor: '#e5e3df', borderWidth: '1px' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#635bff' }}>
                                <CreditCard className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold" style={{ color: '#2d2d2d' }}>
                                    Stripe Configuration
                                </h3>
                                <p className="text-sm" style={{ color: '#7a7a7a' }}>
                                    Accept credit cards and digital wallets
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <input
                                    type="checkbox"
                                    id="stripe_enabled"
                                    checked={data.stripe_enabled}
                                    onChange={(e) => setData('stripe_enabled', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-[#658965] focus:ring-[#658965]"
                                />
                                <label htmlFor="stripe_enabled" className="font-medium" style={{ color: '#2d2d2d' }}>
                                    Enable Stripe Payment Gateway
                                </label>
                            </div>

                            <div>
                                <InputLabel htmlFor="stripe_public_key" value="Publishable Key" />
                                <TextInput
                                    id="stripe_public_key"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.stripe_public_key}
                                    onChange={(e) => setData('stripe_public_key', e.target.value)}
                                    placeholder="pk_live_..."
                                />
                                <InputError message={errors.stripe_public_key} className="mt-2" />
                                <p className="mt-1 text-sm" style={{ color: '#7a7a7a' }}>
                                    Found in your Stripe Dashboard → Developers → API keys
                                </p>
                            </div>

                            <div>
                                <InputLabel htmlFor="stripe_secret_key" value="Secret Key" />
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <TextInput
                                        id="stripe_secret_key"
                                        type="password"
                                        className="mt-1 block w-full pl-10"
                                        value={data.stripe_secret_key}
                                        onChange={(e) => setData('stripe_secret_key', e.target.value)}
                                        placeholder={data.stripe_secret_key === '••••••••' ? '••••••••' : 'sk_live_...'}
                                    />
                                </div>
                                <InputError message={errors.stripe_secret_key} className="mt-2" />
                                <p className="mt-1 text-sm" style={{ color: '#7a7a7a' }}>
                                    {data.stripe_secret_key === '••••••••'
                                        ? 'Leave as ••••••••• to keep existing value'
                                        : 'Stored encrypted - never shown again after saving'}
                                </p>
                            </div>

                            <div>
                                <InputLabel htmlFor="stripe_webhook_secret" value="Webhook Signing Secret" />
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <TextInput
                                        id="stripe_webhook_secret"
                                        type="password"
                                        className="mt-1 block w-full pl-10"
                                        value={data.stripe_webhook_secret}
                                        onChange={(e) => setData('stripe_webhook_secret', e.target.value)}
                                        placeholder={data.stripe_webhook_secret === '••••••••' ? '••••••••' : 'whsec_...'}
                                    />
                                </div>
                                <InputError message={errors.stripe_webhook_secret} className="mt-2" />
                                <p className="mt-1 text-sm" style={{ color: '#7a7a7a' }}>
                                    {data.stripe_webhook_secret === '••••••••'
                                        ? 'Leave as ••••••••• to keep existing value'
                                        : 'Required to verify webhook events from Stripe'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* PayPal Settings */}
                    <div className="bg-white rounded-xl p-8 shadow-md" style={{ borderColor: '#e5e3df', borderWidth: '1px' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0070ba' }}>
                                <DollarSign className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold" style={{ color: '#2d2d2d' }}>
                                    PayPal Configuration
                                </h3>
                                <p className="text-sm" style={{ color: '#7a7a7a' }}>
                                    Accept PayPal and credit cards via PayPal
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <input
                                    type="checkbox"
                                    id="paypal_enabled"
                                    checked={data.paypal_enabled}
                                    onChange={(e) => setData('paypal_enabled', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-[#658965] focus:ring-[#658965]"
                                />
                                <label htmlFor="paypal_enabled" className="font-medium" style={{ color: '#2d2d2d' }}>
                                    Enable PayPal Payment Gateway
                                </label>
                            </div>

                            <div>
                                <InputLabel htmlFor="paypal_client_id" value="Client ID" />
                                <TextInput
                                    id="paypal_client_id"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.paypal_client_id}
                                    onChange={(e) => setData('paypal_client_id', e.target.value)}
                                    placeholder="AX..."
                                />
                                <InputError message={errors.paypal_client_id} className="mt-2" />
                                <p className="mt-1 text-sm" style={{ color: '#7a7a7a' }}>
                                    Found in your PayPal Developer Dashboard → Apps & Credentials
                                </p>
                            </div>

                            <div>
                                <InputLabel htmlFor="paypal_secret" value="Secret" />
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <TextInput
                                        id="paypal_secret"
                                        type="password"
                                        className="mt-1 block w-full pl-10"
                                        value={data.paypal_secret}
                                        onChange={(e) => setData('paypal_secret', e.target.value)}
                                        placeholder={data.paypal_secret === '••••••••' ? '••••••••' : 'EX...'}
                                    />
                                </div>
                                <InputError message={errors.paypal_secret} className="mt-2" />
                                <p className="mt-1 text-sm" style={{ color: '#7a7a7a' }}>
                                    {data.paypal_secret === '••••••••'
                                        ? 'Leave as ••••••••• to keep existing value'
                                        : 'Stored encrypted - never shown again after saving'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Saving...' : 'Save Settings'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </>
    );
}

Settings.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
