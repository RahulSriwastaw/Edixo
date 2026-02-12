'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, MoreVertical, Search, Shield, Globe, Loader2, Edit, Eye, PauseCircle, PlayCircle } from 'lucide-react';
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
    storage_limit_gb?: number;
    whiteboard_enabled?: boolean;
    custom_domain?: string;
    domain_verified?: boolean;
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

  const toggleStatus = async (org: Organization) => {
    const newStatus = org.status === 'active' ? 'suspended' : 'active';
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ status: newStatus })
        .eq('id', org.id);

      if (error) throw error;
      fetchOrgs();
    } catch (error: any) {
      alert('Error updating status: ' + error.message);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, [filter, search]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Organizations</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage institutions and licenses</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md text-sm"
          >
            <Plus size={18} />
            Onboard Organization
          </button>
        </header>

        {/* Filters */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 mb-5 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border-none outline-none focus:ring-2 focus:ring-orange-100 transition-all text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg bg-slate-50 border-none outline-none text-slate-600 font-medium text-sm"
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
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : (
          <div className="grid gap-3">
            {orgs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <Building2 className="mx-auto text-slate-300 mb-3" size={40} />
                <h3 className="text-base font-bold text-slate-900">No organizations found</h3>
                <p className="text-slate-500 text-sm">Onboard a new organization to get started.</p>
              </div>
            ) : (
              orgs.map(org => (
                <div key={org.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {org.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{org.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Globe size={14} /> 
                          {org.settings?.custom_domain || `${org.slug}.qbank.com`}
                          {org.settings?.custom_domain && (
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              org.settings?.domain_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {org.settings?.domain_verified ? 'Verified' : 'Pending'}
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-1.5 uppercase"><Shield size={14} /> {org.plan_type}</span>
                        <span className="flex items-center gap-1.5"><Building2 size={14} /> {org.settings?.storage_limit_gb || 5}GB Storage</span>
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
                      onClick={() => toggleStatus(org)}
                      className={`p-2 rounded-lg transition-colors ${org.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      title={org.status === 'active' ? 'Suspend Organization' : 'Resume Organization'}
                    >
                      {org.status === 'active' ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
                    </button>
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
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
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
