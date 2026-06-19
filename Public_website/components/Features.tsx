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
    title: "Global Question Bank",
    description: "Advanced system to store, organize, and filter thousands of questions for mock tests and practice papers.",
    icon: GraduationCap,
    color: "#FF6B2B",
  },
  {
    title: "AI Paper Generator",
    description: "Generate high-quality question papers and presentations in seconds using advanced AI models.",
    icon: FileText,
    color: "#2196F3",
  },
  {
    title: "Interactive PDF Studio",
    description: "Create professional PDF question papers with custom formatting, layouts, and answer keys.",
    icon: Presentation,
    color: "#9C27B0",
  },
  {
    title: "Question Bank Management",
    description: "Complete control over your question library. Manage packs, sets, and content from one dashboard.",
    icon: LayoutDashboard,
    color: "#4CAF50",
  },
  {
    title: "Lightning Fast",
    description: "Built on modern architecture ensuring high performance, quick search, and instant exports.",
    icon: Zap,
    color: "#FF9800",
  },
  {
    title: "Enterprise Security",
    description: "Role-based access control, data isolation, and secure authentication for total peace of mind.",
    icon: ShieldCheck,
    color: "#F44336",
  },
];

export function Features() {
  return (
    <section id="features" style={{ padding: '60px 0', background: 'var(--bg-body)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            Everything you need for your question bank
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto' }}>
            A comprehensive suite of tools designed to help teachers create, manage, and share question banks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="db-card">
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${feature.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={20} style={{ color: feature.color }} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{feature.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}