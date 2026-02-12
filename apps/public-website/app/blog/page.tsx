import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    category: string;
    readTime: string;
    image?: string;
}

const samplePosts: BlogPost[] = [
    {
        id: '1',
        title: 'How AI is Transforming Question Bank Creation',
        excerpt: 'Discover how artificial intelligence is revolutionizing the way educators create and manage question banks for modern assessments.',
        author: 'Q-Bank Team',
        date: '2024-02-10',
        category: 'AI & Education',
        readTime: '5 min read',
    },
    {
        id: '2',
        title: '10 Best Practices for Creating Effective MCQs',
        excerpt: 'Learn the proven strategies for crafting multiple-choice questions that accurately assess student understanding.',
        author: 'Dr. Sarah Johnson',
        date: '2024-02-08',
        category: 'Teaching Tips',
        readTime: '8 min read',
    },
    {
        id: '3',
        title: 'The Future of Digital Assessments in Education',
        excerpt: 'Explore emerging trends in online testing and how digital platforms are reshaping educational assessment.',
        author: 'Q-Bank Team',
        date: '2024-02-05',
        category: 'Industry Insights',
        readTime: '6 min read',
    },
];

export default function BlogList() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-primary-light to-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold text-gray-900 mb-4">
                            Q-Bank Blog
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Insights, tips, and best practices for modern education
                        </p>
                    </div>
                </div>
            </div>

            {/* Blog Posts */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Category Filter */}
                <div className="flex gap-4 mb-12 overflow-x-auto pb-2">
                    {['All Posts', 'AI & Education', 'Teaching Tips', 'Industry Insights'].map((cat) => (
                        <button
                            key={cat}
                            className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${cat === 'All Posts'
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-gray-600 hover:bg-primary-light hover:text-primary border border-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {samplePosts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.id}`}
                            className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-primary hover:shadow-xl transition-all duration-300"
                        >
                            {/* Image Placeholder */}
                            <div className="h-48 bg-gradient-to-br from-primary-light to-primary/20 flex items-center justify-center">
                                <span className="text-6xl">📚</span>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Category */}
                                <span className="inline-block px-3 py-1 bg-primary-light text-primary text-sm font-semibold rounded-full mb-3">
                                    {post.category}
                                </span>

                                {/* Title */}
                                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                    {post.title}
                                </h2>

                                {/* Excerpt */}
                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {post.excerpt}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            {post.author}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                {/* Read More */}
                                <div className="mt-4 flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                                    Read more
                                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Load More */}
                <div className="text-center mt-12">
                    <button className="px-8 py-4 rounded-xl bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white font-semibold transition-all">
                        Load More Posts
                    </button>
                </div>
            </div>
        </div>
    );
}
