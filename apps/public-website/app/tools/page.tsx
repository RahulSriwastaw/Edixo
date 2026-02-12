import { FileText, Calculator, Sparkles, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const tools = [
    {
        icon: FileText,
        title: 'PDF Question Paper Generator',
        description: 'Generate professional question papers with custom templates and formatting.',
        badge: 'Free',
        href: '#',
    },
    {
        icon: Calculator,
        title: 'Grade Calculator',
        description: 'Calculate student grades, percentages, and GPA with ease.',
        badge: 'Free',
        href: '#',
    },
    {
        icon: Sparkles,
        title: 'Random Name Picker',
        description: 'Randomly select students for classroom activities and presentations.',
        badge: 'Free',
        href: '#',
    },
    {
        icon: FileText,
        title: 'Syllabus Planner',
        description: 'Plan and organize your course syllabus efficiently.',
        badge: 'Pro',
        href: '#',
    },
    {
        icon: Calculator,
        title: 'Attendance Tracker',
        description: 'Track student attendance and generate reports automatically.',
        badge: 'Pro',
        href: '#',
    },
    {
        icon: Download,
        title: 'Batch PDF Converter',
        description: 'Convert multiple documents to PDF format in one click.',
        badge: 'Free',
        href: '#',
    },
];

export default function ToolsPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-primary-light via-white to-primary-light/50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold text-gray-900 mb-4">
                            Free Educational Tools
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Powerful tools to simplify your teaching workflow and save time
                        </p>
                    </div>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tools.map((tool, index) => (
                        <Link
                            key={index}
                            href={tool.href}
                            className="group relative p-8 rounded-2xl border border-gray-200 bg-white hover:border-primary hover:shadow-xl transition-all duration-300"
                        >
                            {/* Badge */}
                            <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${tool.badge === 'Free'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-primary-light text-primary'
                                }`}>
                                {tool.badge}
                            </span>

                            {/* Icon */}
                            <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-light text-primary group-hover:scale-110 transition-transform">
                                <tool.icon className="w-7 h-7" />
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-gray-900 mb-3 pr-16">
                                {tool.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                {tool.description}
                            </p>

                            {/* Try Button */}
                            <div className="flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                                Try it now
                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-20 text-center p-12 bg-gradient-to-br from-primary-light to-white rounded-3xl border-2 border-primary">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Need More Advanced Tools?
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Upgrade to Q-Bank Pro for access to premium tools, unlimited usage, and priority support.
                    </p>
                    <Link
                        href="/#pricing"
                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-primary hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl"
                    >
                        View Pricing Plans
                    </Link>
                </div>
            </div>
        </div>
    );
}
