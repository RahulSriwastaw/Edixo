'use client';

import React, { useState, useEffect } from 'react';
import { MonitorPlay, Download, Smartphone, Laptop, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';

interface WhiteboardVersion {
  id: string;
  platform: string;
  version: string;
  download_url: string;
  is_active: boolean;
  force_update: boolean;
  created_at: string;
}

export default function WhiteboardPage() {
  const [versions, setVersions] = useState<WhiteboardVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'windows',
    version: '',
    download_url: '',
    is_active: true,
    force_update: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('id, platform, version, download_url, is_active, force_update, created_at')
        .eq('type', 'whiteboard_app')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVersions((data || []) as WhiteboardVersion[]);
    } catch (error) {
      console.error('Error fetching whiteboard versions:', error);
      alert('Error fetching whiteboard versions. Please check Supabase connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.version || !formData.download_url) {
      alert('Version and Download URL are required.');
      return;
    }

    setSaving(true);

    if (editingId) {
      try {
        const { error } = await supabase
          .from('tools')
          .update({
            platform: formData.platform,
            version: formData.version,
            download_url: formData.download_url,
            is_active: formData.is_active,
            force_update: formData.force_update,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;

        alert('Version updated successfully!');
        await fetchVersions();
      } catch (error: any) {
        console.error('Error updating version:', error);
        alert('Error updating version: ' + error.message);
      }
    } else {
      try {
        const { error } = await supabase.from('tools').insert([
          {
            type: 'whiteboard_app',
            platform: formData.platform,
            version: formData.version,
            download_url: formData.download_url,
            is_active: formData.is_active,
            force_update: formData.force_update,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        alert('Version added successfully!');
        await fetchVersions();
      } catch (error: any) {
        console.error('Error adding version:', error);
        alert('Error adding version: ' + error.message);
      }
    }

    setSaving(false);
    resetForm();
  };

  const handleEdit = (version: WhiteboardVersion) => {
    setFormData({
      platform: version.platform,
      version: version.version,
      download_url: version.download_url,
      is_active: version.is_active,
      force_update: version.force_update,
    });
    setEditingId(version.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this version?')) return;

    const deleteVersion = async () => {
      try {
        const { error } = await supabase.from('tools').delete().eq('id', id);
        if (error) throw error;

        alert('Version deleted successfully!');
        fetchVersions();
      } catch (error: any) {
        console.error('Error deleting version:', error);
        alert('Error deleting version: ' + error.message);
      }
    };

    deleteVersion();
  };

  const resetForm = () => {
    setFormData({
      platform: 'windows',
      version: '',
      download_url: '',
      is_active: true,
      force_update: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'windows' ? <Laptop size={20} /> : <Smartphone size={20} />;
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Whiteboard App Control</h1>
            <p className="text-slate-500 mt-2">Manage whiteboard app versions and download links.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus size={20} />
            Add New Version
          </button>
        </header>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingId ? 'Edit Version' : 'Add New Version'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Platform</label>
                  <select
                    required
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  >
                    <option value="windows">Windows</option>
                    <option value="android">Android</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Version</label>
                  <input
                    required
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    placeholder="e.g. v1.0.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Download URL</label>
                <input
                  required
                  type="url"
                  value={formData.download_url}
                  onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-200"
                  />
                  <span className="text-sm font-medium text-slate-700">Active</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.force_update}
                    onChange={(e) => setFormData({ ...formData, force_update: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-2 focus:ring-red-200"
                  />
                  <span className="text-sm font-medium text-slate-700">Force Update</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Version' : 'Add Version'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Versions List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
        ) : (
          <div className="space-y-4">
            {versions.map((version) => (
              <div
                key={version.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${version.platform === 'windows'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-green-100 text-green-600'
                      }`}>
                      {getPlatformIcon(version.platform)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-slate-900 capitalize">{version.platform}</h3>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold">
                          {version.version}
                        </span>
                        {version.is_active && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold">
                            Active
                          </span>
                        )}
                        {version.force_update && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">
                            Force Update
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <Download size={14} />
                        {version.download_url}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(version)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit Version"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(version.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Version"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {versions.length === 0 && (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
                <MonitorPlay className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-lg font-bold text-slate-900">No versions available</h3>
                <p className="text-slate-500 mb-6">Add your first whiteboard app version.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium inline-flex items-center gap-2 transition-colors"
                >
                  <Plus size={18} />
                  Add Version
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
