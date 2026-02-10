'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, MoreVertical, Search, Shield, Globe, Loader2, Edit, Eye } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CreateOrgModal from '../../components/organizations/CreateOrgModal';
import EditOrgModal from '../../components/organizations/EditOrgModal';
import OrgDetailsModal from '../../components/organizations/OrgDetailsModal';
import { supabase } from '../../lib/supabase';

interface Organization {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan_type: string;
  created_at: string;
  settings: {
    max_teachers?: number;
    max_courses?: number;
    whiteboard_enabled?: boolean;
  };
}

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [filter, setFilter] = useState('All Status');
  const [search, setSearch] = useState('');

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'All Status') {
        query = query.eq('status', filter.toLowerCase());
      }

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrgs(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, [filter, search]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Organizations</h1>
            <p className="text-slate-500 mt-2">Manage all registered institutions and their licenses.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus size={20} />
            Onboard Organization
          </button>
        </header>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-slate-50 border-none outline-none text-slate-600 font-medium"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Suspended</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
        ) : (
          <div className="grid gap-4">
            {orgs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <Building2 className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-lg font-bold text-slate-900">No organizations found</h3>
                <p className="text-slate-500">Get started by onboarding a new organization.</p>
              </div>
            ) : (
              orgs.map(org => (
                <div key={org.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-indigo-100">
                      {org.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{org.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><Globe size={14} /> {org.slug}.qbank.com</span>
                        <span className="flex items-center gap-1.5 uppercase"><Shield size={14} /> {org.plan_type}</span>
                        {/* <span className="flex items-center gap-1.5"><Building2 size={14} /> {org.users} Users</span> */}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${org.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      org.status === 'suspended' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                      {org.status}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedOrg(org);
                        setIsDetailsModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrg(org);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit Organization"
                    >
                      <Edit size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <CreateOrgModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchOrgs}
        />

        <EditOrgModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedOrg(null);
          }}
          onSuccess={() => {
            fetchOrgs();
            setIsEditModalOpen(false);
            setSelectedOrg(null);
          }}
          organization={selectedOrg}
        />

        <OrgDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedOrg(null);
          }}
          organization={selectedOrg}
        />
      </div>
    </DashboardLayout>
  );
}
