'use client';

import React, { useState } from 'react';
import { FolderTree, Plus } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';

export default function CourseCategoriesPage() {
  const [categories] = useState<any[]>([]);

  return (
    <DashboardLayout>
      <div>
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Course Categories</h1>
            <p className="text-slate-500 text-sm mt-0.5">Organize courses by category</p>
          </div>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm">
            <Plus size={18} />
            Add Category
          </button>
        </header>
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <FolderTree className="mx-auto text-slate-300 mb-3" size={40} />
          <h3 className="text-base font-bold text-slate-900">No categories yet</h3>
          <p className="text-slate-500 text-sm mt-1">Create categories to organize your courses.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
