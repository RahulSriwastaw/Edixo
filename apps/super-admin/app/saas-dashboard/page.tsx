'use client';

import React from 'react';
import { 
  FileText, 
  Zap, 
  PlusSquare, 
  BookOpen, 
  Database, 
  Users, 
  Settings,
  TrendingUp,
  BarChart3,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { DashboardCard } from '../../components/saas/DashboardCard';

const dashboardItems = [
  {
    title: "Tests",
    description: "Manage tests, questions, and test series for your students.",
    icon: FileText,
    href: "/quizzes/list",
    color: "bg-orange-50"
  },
  {
    title: "Extract",
    description: "AI-powered question extraction from PDF documents.",
    icon: Zap,
    href: "/extract",
    color: "bg-orange-50"
  },
  {
    title: "Create",
    description: "Create educational content, documents, and interactive resources.",
    icon: PlusSquare,
    href: "/content/add",
    color: "bg-orange-50"
  },
  {
    title: "Courses",
    description: "Manage your courses, batches, and user groups.",
    icon: BookOpen,
    href: "/courses",
    color: "bg-orange-50"
  },
  {
    title: "Resources",
    description: "Centralized management of all your learning resources.",
    icon: Database,
    href: "/content",
    color: "bg-orange-50"
  },
  {
    title: "Users",
    description: "Monitor user activity and manage administrative permissions.",
    icon: Users,
    href: "/admin/staff",
    color: "bg-orange-50"
  },
  {
    title: "Settings",
    description: "Configure your organization's global preferences.",
    icon: Settings,
    href: "/settings",
    color: "bg-orange-50"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function SaaSPage() {
  return (
    <div className="p-5 max-w-7xl mx-auto">
      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Students', value: '12,482', change: '+12%', icon: Users },
          { label: 'Active Courses', value: '42', change: '+5%', icon: BookOpen },
          { label: 'Avg. Test Score', value: '78%', change: '+2.4%', icon: BarChart3 },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={stat.label}
            className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-0.5">{stat.label}</p>
              <div className="flex items-end gap-1.5">
                <h3 className="text-xl font-bold text-slate-900">{stat.value}</h3>
                <span className="text-[10px] font-bold text-emerald-500 mb-0.5">{stat.change}</span>
              </div>
            </div>
            <div className="h-10 w-10 bg-[#FFF7ED] rounded-lg flex items-center justify-center text-[#FF5A1F]">
              <stat.icon size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mb-5">
        <h2 className="text-[18px] font-bold text-slate-900 mb-0.5">Quick Actions</h2>
        <p className="text-[#6B7280] text-[13px]">Manage your educational portal efficiently.</p>
      </div>

      {/* Main Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {dashboardItems.map((dashboardItem) => (
          <motion.div key={dashboardItem.title} variants={item}>
            <DashboardCard {...dashboardItem} />
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-bold text-slate-900">Recent Activity</h2>
          <button className="text-[13px] font-bold text-[#FF5A1F] hover:underline">View All</button>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          {[
            { action: 'Test Created', detail: 'NEET Physics - Chapter 4', user: 'Rahul S.', time: '2 mins ago', icon: FileText },
            { action: 'Course Updated', detail: 'Mathematics Foundation', user: 'Priya P.', time: '1 hour ago', icon: BookOpen },
            { action: 'User Assigned', detail: '120 Students to Chemistry Batch', user: 'Admin', time: '3 hours ago', icon: Users },
          ].map((activity, i) => (
            <div key={i} className={cn(
              "p-3 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors",
              i !== 0 && "border-t border-[#E5E7EB]"
            )}>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center text-[#FF5A1F]">
                  <activity.icon size={16} />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-slate-900">{activity.action}</div>
                  <div className="text-[11px] text-[#6B7280]">{activity.detail} • by {activity.user}</div>
                </div>
              </div>
              <div className="text-[11px] font-medium text-[#6B7280] flex items-center gap-1">
                <Calendar size={10} />
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
