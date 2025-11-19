export default function InertiaIcon({ size = 48 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <title>Inertia.js</title>
            <defs>
                <linearGradient id="a" x1="0" x2="128" y1="64" y2="64" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stop-color="#9553e9"></stop>
                    <stop offset="1" stop-color="#6d74ed"></stop>
                </linearGradient>
            </defs>
            <path fill="url(#a)" d="M92.433 28.433H55.625L91.192 64 55.625 99.567h36.808L128 64zm-55.625 0H0L35.567 64 0 99.567h36.808L72.375 64z"></path>
        </svg>
    );
}
