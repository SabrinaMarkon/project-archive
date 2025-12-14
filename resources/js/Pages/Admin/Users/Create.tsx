import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';

export default function Create() {
    type CreateUserFormData = {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        is_admin: boolean;
    };

    const { data, setData, post, processing, errors } = useForm<CreateUserFormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        is_admin: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    return (
        <>
            <Head title="Create User" />

            <div className="mb-6">
                <h1 className="text-3xl font-bold" style={{ color: '#2d2d2d' }}>
                    Create New User
                </h1>
                <p className="text-sm mt-1" style={{ color: '#7a7a7a' }}>
                    Add a new user to the system
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={submit}>
                    <div className="mb-4">
                        <InputLabel htmlFor="name" value="Name" />
                        <TextInput
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="email"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                        <p className="text-xs mt-1" style={{ color: '#7a7a7a' }}>
                            Minimum 8 characters
                        </p>
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center">
                            <Checkbox
                                name="is_admin"
                                checked={data.is_admin}
                                onChange={(e) => setData('is_admin', e.target.checked)}
                            />
                            <span className="ms-2 text-sm" style={{ color: '#5a5a5a' }}>
                                Admin user (can access admin panel)
                            </span>
                        </label>
                    </div>

                    <div className="flex items-center gap-4">
                        <PrimaryButton disabled={processing}>
                            Create User
                        </PrimaryButton>
                        <Link href={route('admin.users.index')}>
                            <SecondaryButton type="button">
                                Cancel
                            </SecondaryButton>
                        </Link>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
