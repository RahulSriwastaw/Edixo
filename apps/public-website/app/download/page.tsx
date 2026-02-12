import { Download, Monitor, Smartphone, CheckCircle, Star } from 'lucide-react';
import Link from 'next/link';

const features = [
    'Real-time collaboration',
    'Infinite canvas',
    'Multiple drawing tools',
    'Shape library',
    'Export to PNG/PDF',
    'Keyboard shortcuts',
];

const platforms = [
    {
        name: 'Windows',
        icon: Monitor,
        version: 'v2.1.0',
        size: '85 MB',
        downloadUrl: '#',
    },
    {
        name: 'Android',
        icon: Smartphone,
        version: 'v2.0.5',
        size: '45 MB',
        downloadUrl: '#',
    },
];

export default function WhiteboardDownload() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-light via-white to-primary-light/50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary text-white mb-6">
                            <Monitor className="w-10 h-10" />
                        </div>
                        <h1 className="text-5xl font-bold text-gray-900 mb-4">
                            Download Q-Bank Whiteboard
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            The ultimate digital whiteboard for interactive teaching and collaboration
                        </p>
                    </div>

                    {/* Download Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {platforms.map((platform) => (
                            <div
                                key={platform.name}
                                className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-primary hover:shadow-xl transition-all"
                            >
                                {/* Platform Icon */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                                            <platform.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">{platform.name}</h3>
                                            <p className="text-sm text-gray-500">{platform.version}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-600">{platform.size}</span>
                                </div>

                                {/* Download Button */}
                                <Link
                                    href={platform.downloadUrl}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                                >
                                    <Download className="w-5 h-5" />
                                    Download for {platform.name}
                                </Link>

                                {/* System Requirements */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">
                                        {platform.name === 'Windows'
                                            ? 'Requires: Windows 10 or later (64-bit)'
                                            : 'Requires: Android 8.0 or later'
                                        }
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need for Interactive Teaching
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Packed with powerful features to enhance your digital classroom experience
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {features.map((feature) => (
                            <div
                                key={feature}
                                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200"
                            >
                                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                <span className="text-gray-700 font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Screenshots/Preview Section */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            See It In Action
                        </h2>
                    </div>

                    {/* Large Preview */}
                    <div className="rounded-3xl overflow-hidden border-2 border-gray-200 shadow-2xl">
                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <div className="text-center">
                                <Monitor className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">Whiteboard Preview</p>
                            </div>
                        </div>
                    </div>

                    {/* Small Previews */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews/Testimonials */}
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Loved by Educators Worldwide
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Sarah Johnson',
                                role: 'Mathematics Teacher',
                                comment: 'The best digital whiteboard I\'ve used. Makes online teaching so much easier!',
                            },
                            {
                                name: 'Raj Patel',
                                role: 'Physics Instructor',
                                comment: 'Love the infinite canvas and range of drawing tools. Game changer for physics diagrams.',
                            },
                            {
                                name: 'Emily Chen',
                                role: 'Chemistry Professor',
                                comment: 'Students love the collaborative features. Highly recommended for remote teaching.',
                            },
                        ].map((review, i) => (
                            <div key={i} className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-4 italic">"{review.comment}"</p>
                                <div>
                                    <p className="font-semibold text-gray-900">{review.name}</p>
                                    <p className="text-sm text-gray-500">{review.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="py-20 bg-gradient-to-br from-primary-light to-white">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Ready to Transform Your Teaching?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join thousands of educators using Q-Bank Whiteboard for better learning experiences.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="#"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-primary hover:bg-primary-hover transition-all shadow-lg"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            Download Now
                        </Link>
                        <Link
                            href="/#pricing"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-primary bg-white border-2 border-primary hover:bg-primary-light transition-all"
                        >
                            View Plans
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
