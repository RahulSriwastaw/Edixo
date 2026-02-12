import { Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BlogPost() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Link
                        href="/blog"
                        className="inline-flex items-center text-primary hover:gap-2 transition-all mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Blog
                    </Link>

                    {/* Category */}
                    <span className="inline-block px-3 py-1 bg-primary-light text-primary text-sm font-semibold rounded-full mb-4">
                        AI & Education
                    </span>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        How AI is Transforming Question Bank Creation
                    </h1>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-6 text-gray-600">
                        <span className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Q-Bank Team
                        </span>
                        <span className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            February 10, 2024
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            5 min read
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Featured Image */}
                <div className="mb-12 rounded-2xl overflow-hidden">
                    <div className="h-96 bg-gradient-to-br from-primary-light to-primary/20 flex items-center justify-center">
                        <span className="text-9xl">🤖</span>
                    </div>
                </div>

                {/* Article Body */}
                <div className="prose prose-lg max-w-none">
                    <p className="text-xl text-gray-700 leading-relaxed mb-6">
                        Artificial intelligence is revolutionizing the way educators create and manage question banks.
                        In this article, we'll explore how AI-powered tools are making assessment creation faster,
                        more efficient, and more accurate than ever before.
                    </p>

                    <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
                        The Challenge of Traditional Question Banking
                    </h2>

                    <p className="text-gray-700 leading-relaxed mb-6">
                        Creating a comprehensive question bank has traditionally been a time-consuming process.
                        Educators spend countless hours crafting questions, ensuring quality, and organizing them
                        by subject, difficulty, and learning objectives.
                    </p>

                    <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
                        How AI Changes the Game
                    </h2>

                    <p className="text-gray-700 leading-relaxed mb-4">
                        Modern AI tools can:
                    </p>

                    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6 ml-4">
                        <li>Generate questions automatically from textbooks and study materials</li>
                        <li>Ensure proper difficulty distribution across topics</li>
                        <li>Suggest improvements to existing questions</li>
                        <li>Create multiple variations of questions to prevent cheating</li>
                        <li>Categorize and tag questions automatically</li>
                    </ul>

                    <div className="bg-primary-light border-l-4 border-primary p-6 rounded-r-xl my-8">
                        <p className="text-gray-800 font-semibold mb-2">💡 Pro Tip:</p>
                        <p className="text-gray-700">
                            While AI can generate questions quickly, always review and refine them to ensure they align
                            with your specific learning objectives and teaching style.
                        </p>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
                        Best Practices for AI-Assisted Question Creation
                    </h2>

                    <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-6 ml-4">
                        <li className="leading-relaxed">
                            <strong>Start with quality source material:</strong> Feed AI tools with well-structured
                            content for better question generation.
                        </li>
                        <li className="leading-relaxed">
                            <strong>Review and refine:</strong> Always manually review AI-generated questions for
                            accuracy and relevance.
                        </li>
                        <li className="leading-relaxed">
                            <strong>Maintain diversity:</strong> Ensure questions cover various cognitive levels
                            (recall, understanding, application, analysis).
                        </li>
                        <li className="leading-relaxed">
                            <strong>Test and iterate:</strong> Use student feedback to continuously improve
                            your question bank.
                        </li>
                    </ol>

                    <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
                        The Future of Assessment
                    </h2>

                    <p className="text-gray-700 leading-relaxed mb-6">
                        As AI technology continues to evolve, we can expect even more sophisticated tools
                        that understand context, adapt to individual learning styles, and provide personalized
                        assessments. The future of education is here, and it's powered by intelligent automation.
                    </p>

                    {/* CTA */}
                    <div className="mt-12 p-8 bg-gradient-to-br from-primary-light to-white rounded-2xl border-2 border-primary">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Ready to transform your question banking?
                        </h3>
                        <p className="text-gray-700 mb-6">
                            Try Q-Bank's AI-powered question generation tools and create better assessments in less time.
                        </p>
                        <Link
                            href="/#pricing"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-primary hover:bg-primary-hover transition-all"
                        >
                            Get Started Free
                        </Link>
                    </div>
                </div>

                {/* Share & Tags */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2 mb-6">
                        {['AI', 'Education', 'Question Banks', 'Assessment'].map((tag) => (
                            <span
                                key={tag}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-primary-light hover:text-primary cursor-pointer transition-colors"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </article>

            {/* Related Posts */}
            <div className="bg-white py-16 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <Link
                                key={i}
                                href="/blog"
                                className="group p-6 bg-gray-50 rounded-xl hover:bg-primary-light transition-colors"
                            >
                                <h3 className="font-bold text-gray-900 group-hover:text-primary mb-2">
                                    Related Article Title {i}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Short description of the related article...
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
