// Shared Inertia data types (from middleware)
export interface SharedCourseSettings {
    paymentSettings: {
        stripeConfigured: boolean;
        paypalConfigured: boolean;
    };
}
