import { Link } from '@inertiajs/react';
import { GraduationCap, DollarSign } from 'lucide-react';

interface Course {
    id: number;
    title: string;
    description: string | null;
    price: string;
    payment_type: 'one_time' | 'monthly' | 'annual';
    modules_count: number;
}

interface FeaturedCoursesProps {
    courses: Course[];
    limit?: number;
}

export default function FeaturedCourses({ courses, limit = 3 }: FeaturedCoursesProps) {
    const displayedCourses = courses.slice(0, limit);

    if (displayedCourses.length === 0) {
        return null;
    }

    return (
        <section id="courses" className="py-24 px-6" style={{ backgroundColor: '#d8e5b8' }}>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-bold mb-6" style={{ color: '#2d2d2d' }}>
                        Featured Courses
                    </h2>
                    <p className="text-xl max-w-2xl mx-auto" style={{ color: '#4a4a4a' }}>
                        Learn from comprehensive courses designed to accelerate your development journey
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
                    {displayedCourses.map((course) => (
                        <div
                            key={course.id}
                            className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                        >
                            <div className="flex items-center gap-2 mb-4" style={{ color: '#7a9d7a' }}>
                                <GraduationCap size={24} />
                                <span className="text-sm font-semibold uppercase tracking-wide">Course</span>
                            </div>

                            <h3 className="text-2xl font-bold mb-3" style={{ color: '#2d2d2d' }}>
                                {course.title}
                            </h3>

                            <p className="mb-4 line-clamp-3" style={{ color: '#5a5a5a' }}>
                                {course.description || 'Comprehensive course content'}
                            </p>

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-1" style={{ color: '#2d2d2d' }}>
                                    <DollarSign size={20} style={{ color: '#7a9d7a' }} />
                                    <span className="text-xl font-bold">{course.price}</span>
                                </div>
                                <span className="text-sm" style={{ color: '#7a7a7a' }}>
                                    {course.modules_count} {course.modules_count === 1 ? 'module' : 'modules'}
                                </span>
                            </div>

                            <Link
                                href={`/courses/${course.id}`}
                                className="block w-full text-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg"
                                style={{ backgroundColor: '#7a9d7a' }}
                            >
                                View Course
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <Link
                        href={route('courses.index')}
                        className="inline-block px-8 py-4 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg"
                        style={{ backgroundColor: '#658965' }}
                    >
                        Browse All Courses
                    </Link>
                </div>
            </div>
        </section>
    );
}
