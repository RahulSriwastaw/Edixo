'use client';

import React, { useState } from 'react';
import { X, Save, Loader2, Copy, CheckCircle, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface GeneratedCredentials {
  email: string;
  password: string;
  full_name: string;
}

export default function CreateOrgModal({ isOpen, onClose, onSuccess }: CreateOrgModalProps) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<GeneratedCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    org_name: '',
    org_slug: '',
    plan_type: 'free',
    admin_name: '',
    admin_email: '',
    admin_phone: '',
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setShowSuccess(false);
    setGeneratedCredentials(null);
    setFormData({
      org_name: '',
      org_slug: '',
      plan_type: 'free',
      admin_name: '',
      admin_email: '',
      admin_phone: '',
    });
    onClose();
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Create Organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([
          {
            name: formData.org_name,
            slug: formData.org_slug || formData.org_name.toLowerCase().replace(/\s+/g, '-'),
            plan_type: formData.plan_type,
            status: 'active'
          }
        ])
        .select()
        .single();

      if (orgError) throw new Error('Failed to create organization: ' + orgError.message);

      // Step 2: Create Org Admin via API
      const response = await fetch('/api/create-org-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: orgData.id,
          email: formData.admin_email,
          full_name: formData.admin_name,
          phone: formData.admin_phone || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Rollback: Delete the organization
        await supabase.from('organizations').delete().eq('id', orgData.id);
        throw new Error(result.error || 'Failed to create admin user');
      }

      // Show success modal with credentials
      setGeneratedCredentials({
        email: result.email,
        password: result.password,
        full_name: result.full_name,
      });
      setShowSuccess(true);
      onSuccess();

    } catch (error: any) {
      alert('Error: ' + error.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Success Modal
  if (showSuccess && generatedCredentials) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="text-white" size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Organization Created!</h2>
            </div>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span>Save these credentials now! They won't be shown again.</span>
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Admin Name</label>
                <div className="px-4 py-2 bg-slate-50 rounded-lg text-sm font-medium text-slate-900">
                  {generatedCredentials.full_name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email (Login ID)</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2 bg-slate-50 rounded-lg text-sm font-mono text-slate-900">
                    {generatedCredentials.email}
                  </div>
                  <button
                    onClick={() => copyToClipboard(generatedCredentials.email, 'email')}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Copy Email"
                  >
                    {copiedField === 'email' ? (
                      <CheckCircle size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} className="text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Password (Auto-generated)</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2 bg-indigo-50 rounded-lg text-sm font-mono text-indigo-900 font-bold">
                    {generatedCredentials.password}
                  </div>
                  <button
                    onClick={() => copyToClipboard(generatedCredentials.password, 'password')}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Copy Password"
                  >
                    {copiedField === 'password' ? (
                      <CheckCircle size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} className="text-slate-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-800">
                <strong>Next Steps:</strong> Share these credentials with the organization admin.
                They can change their password after first login.
              </p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create Form
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Onboard New Organization</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Organization Details */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="text-lg">🏢</span>
              Organization Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name *</label>
                <input
                  required
                  type="text"
                  value={formData.org_name}
                  onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  placeholder="e.g. Delhi Public School"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={formData.org_slug}
                  onChange={(e) => setFormData({ ...formData, org_slug: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  placeholder="e.g. dps-delhi"
                />
                <p className="text-xs text-slate-500 mt-1">Leave empty to auto-generate from name.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plan Type</label>
                <select
                  value={formData.plan_type}
                  onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
          </div>

          {/* Admin Details */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <UserPlus size={18} className="text-indigo-600" />
              Organization Admin Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Full Name *</label>
                <input
                  required
                  type="text"
                  value={formData.admin_name}
                  onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email *</label>
                <input
                  required
                  type="email"
                  value={formData.admin_email}
                  onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  placeholder="admin@school.com"
                />
                <p className="text-xs text-slate-500 mt-1">This will be used as the login ID.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Phone (Optional)</label>
                <input
                  type="tel"
                  value={formData.admin_phone}
                  onChange={(e) => setFormData({ ...formData, admin_phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <p className="text-xs text-indigo-800">
              <strong>🔐 Security:</strong> A secure password will be auto-generated and shown only once after creation.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Create Organization & Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
