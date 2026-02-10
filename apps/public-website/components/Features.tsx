import { 
  LayoutDashboard, 
  GraduationCap, 
  Presentation, 
  FileText, 
  Zap,
  ShieldCheck 
} from "lucide-react";

const features = [
  {
    title: "Organization Admin",
    description: "Complete control over your institute. Manage students, teachers, fees, and branding from a single dashboard.",
    icon: LayoutDashboard,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Student Learning App",
    description: "A dedicated app for students to access courses, take tests, view analytics, and track their progress.",
    icon: GraduationCap,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Interactive Whiteboard",
    description: "Low-latency digital whiteboard for live teaching with recording capabilities and infinite canvas.",
    icon: Presentation,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "AI Paper Generator",
    description: "Generate high-quality question papers and PPTs in seconds using advanced AI models.",
    icon: FileText,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Lightning Fast",
    description: "Built on a modern monorepo architecture ensuring high performance and scalability.",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    title: "Enterprise Security",
    description: "Role-based access control (RBAC), data isolation, and secure authentication for total peace of mind.",
    icon: ShieldCheck,
    color: "bg-red-100 text-red-600",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to run your institute
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive suite of tools designed to modernize education delivery and management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
