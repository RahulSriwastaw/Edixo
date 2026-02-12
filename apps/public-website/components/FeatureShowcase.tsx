import { BookOpen, FileText, PresentationIcon, Sparkles, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const features = [
    {
        icon: BookOpen,
        title: 'Question Bank Management',
        description: 'Create, organize, and manage thousands of questions with advanced filtering and categorization.',
        color: 'primary',
    },
    {
        icon: FileText,
        title: 'PDF Studio',
        description: 'Generate professional question papers and study materials with customizable templates.',
        color: 'secondary',
    },
    {
        icon: PresentationIcon,
        title: 'PPT Generator',
        description: 'Create engaging presentations automatically from your question bank and content library.',
        color: 'primary',
    },
    {
        icon: Sparkles,
        title: 'AI Question Generation',
        description: 'Leverage AI to generate high-quality questions from your study materials instantly.',
        color: 'secondary',
    },
    {
        icon: Users,
        title: 'Teacher & Student Management',
        description: 'Comprehensive user management with role-based access and permissions.',
        color: 'primary',
    },
    {
        icon: BarChart3,
        title: 'Analytics & Insights',
        description: 'Track student performance, test completion rates, and learning patterns.',
        color: 'secondary',
    },
];

export default function FeatureShowcase() {
    return (
        <section id="features" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Powerful Features for Modern Education
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Everything you need to streamline your educational institution, from question management to student analytics.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-8 rounded-2xl border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 bg-white"
                        >
                            {/* Icon */}
                            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-light text-primary group-hover:scale-110 transition-transform">
                                <feature.icon className="w-8 h-8" />
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Learn More Link */}
                            <Link
                                href="#"
                                className="inline-flex items-center mt-4 text-primary font-semibold hover:gap-2 transition-all group/link"
                            >
                                Learn more
                                <svg
                                    className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <Link
                        href="#pricing"
                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-primary hover:bg-primary-hover transition-all hover:scale-105 shadow-lg shadow-primary/20"
                    >
                        Get Started Free
                    </Link>
                </div>
            </div>
        </section>
    );
}
