import { Head, Link } from "@inertiajs/react";
import PortfolioLayout from "@/Layouts/PortfolioLayout";
import ContactSection from "@/Components/Portfolio/ContactSection";
import { BookOpen, Clock, DollarSign, AlertTriangle } from "lucide-react";
import { SharedCourseSettings } from "@/types/sharedsettings";

interface Course {
    id: number;
    title: string;
    description: string | null;
    price: string;
    payment_type: "one_time" | "monthly" | "annual";
    stripe_enabled: boolean;
    paypal_enabled: boolean;
    modules_count: number;
}

interface PageProps {
    courses: Course[];
    sharedCourseSettings: SharedCourseSettings;
}

export default function Index({ courses, sharedCourseSettings }: PageProps) {
    const formatPaymentType = (type: string) => {
        switch (type) {
            case "one_time":
                return "One-time payment";
            case "monthly":
                return "Monthly subscription";
            case "annual":
                return "Annual subscription";
            default:
                return type;
        }
    };

    const isAnyPaymentConfigured =
        sharedCourseSettings.paymentSettings.stripeConfigured ||
        sharedCourseSettings.paymentSettings.paypalConfigured;

    return (
        <PortfolioLayout>
            <Head title="Courses - Sabrina Markon" />

            {/* Courses Header */}
            <section className="pt-32 pb-12 px-6 bg-white">
                <div className="max-w-6xl mx-auto text-center">
                    <h1
                        className="text-5xl md:text-6xl font-bold mb-6"
                        style={{ color: "#2d2d2d" }}
                    >
                        Courses
                    </h1>
                    <p
                        className="text-xl max-w-2xl mx-auto"
                        style={{ color: "#5a5a5a" }}
                    >
                        Comprehensive courses to accelerate your development
                        journey
                    </p>
                </div>
            </section>

            {!isAnyPaymentConfigured && courses.length > 0 && (
                <section
                    className="py-4 px-6"
                    style={{ backgroundColor: "#fef3c7" }}
                >
                    <div
                        className="max-w-6xl mx-auto flex items-center gap-3 text-sm font-medium"
                        style={{ color: "#b45309" }}
                    >
                        <AlertTriangle size={20} />
                        <span>
                            Warning: No payment gateways are configured.
                            Checkout is temporarily disabled.
                        </span>
                    </div>
                </section>
            )}

            {/* Courses Grid */}
            <section
                className="py-12 pb-24 px-6"
                style={{ backgroundColor: "#d8e5b8" }}
            >
                <div className="max-w-6xl mx-auto">
                    <div
                        className="grid gap-8"
                        style={{
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(350px, 1fr))",
                        }}
                    >
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105"
                            >
                                <div className="p-6">
                                    <h2
                                        className="text-2xl font-bold mb-3"
                                        style={{ color: "#2d2d2d" }}
                                    >
                                        {course.title}
                                    </h2>

                                    <p
                                        className="text-base mb-4"
                                        style={{ color: "#5a5a5a" }}
                                    >
                                        {course.description ||
                                            "No description available"}
                                    </p>

                                    <div
                                        className="flex items-center gap-4 mb-4 text-sm"
                                        style={{ color: "#7a7a7a" }}
                                    >
                                        <div className="flex items-center gap-1">
                                            <BookOpen
                                                size={16}
                                                style={{ color: "#658965" }}
                                            />
                                            <span>
                                                {course.modules_count}{" "}
                                                {course.modules_count === 1
                                                    ? "module"
                                                    : "modules"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock
                                                size={16}
                                                style={{ color: "#658965" }}
                                            />
                                            <span>
                                                {formatPaymentType(
                                                    course.payment_type,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-1">
                                            <DollarSign
                                                size={20}
                                                style={{ color: "#658965" }}
                                            />
                                            <span
                                                className="text-2xl font-bold"
                                                style={{ color: "#2d2d2d" }}
                                            >
                                                {course.price}
                                            </span>
                                            {course.payment_type !==
                                                "one_time" && (
                                                <span
                                                    className="text-sm"
                                                    style={{ color: "#7a7a7a" }}
                                                >
                                                    /{" "}
                                                    {course.payment_type ===
                                                    "monthly"
                                                        ? "month"
                                                        : "year"}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {sharedCourseSettings.paymentSettings
                                                .stripeConfigured &&
                                                course.stripe_enabled && (
                                                    <span
                                                        className="px-2 py-1 rounded text-xs font-medium"
                                                        style={{
                                                            backgroundColor:
                                                                "#e3f2fd",
                                                            color: "#1976d2",
                                                        }}
                                                    >
                                                        Stripe
                                                    </span>
                                                )}
                                            {sharedCourseSettings.paymentSettings
                                                .paypalConfigured &&
                                                course.paypal_enabled && (
                                                    <span
                                                        className="px-2 py-1 rounded text-xs font-medium"
                                                        style={{
                                                            backgroundColor:
                                                                "#fff3e0",
                                                            color: "#f57c00",
                                                        }}
                                                    >
                                                        PayPal
                                                    </span>
                                                )}
                                        </div>
                                    </div>

                                    <Link
                                        href={`/courses/${course.id}`}
                                        className="block w-full text-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
                                        style={{ backgroundColor: "#658965" }}
                                    >
                                        View Course
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {courses.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-xl" style={{ color: "#5a5a5a" }}>
                                No courses available yet.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <ContactSection />
        </PortfolioLayout>
    );
}
