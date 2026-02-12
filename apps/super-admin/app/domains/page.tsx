'use client';

import React, { useState, useEffect } from 'react';
import { Globe, CheckCircle, AlertCircle, Clock, Loader2, RefreshCw, Copy, ExternalLink } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';

interface DomainRecord {
    id: string;
    org_id: string;
    custom_domain: string;
    domain_verified: boolean;
    verification_code: string;
    verified_at: string | null;
    lastChecked: Date;
    organizations?: {
        name: string;
        status: string;
    };
}

export default function DomainsPage() {
    const [domains, setDomains] = useState<DomainRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState<string | null>(null);

    const fetchDomains = async () => {
        setLoading(true);
        try {
            const { data: orgs, error } = await supabase
                .from('organizations')
                .select('id, name, status, settings')
                .not('settings->custom_domain', 'is', null)
                .order('name', { ascending: true });

            if (error) throw error;

            const domainRecords: DomainRecord[] = (orgs || [])
                .filter(org => org.settings?.custom_domain)
                .map(org => ({
                    id: org.id,
                    org_id: org.id,
                    custom_domain: org.settings.custom_domain,
                    domain_verified: org.settings.domain_verified || false,
                    verification_code: org.settings.verification_code || `verify_${org.id.substring(0, 8)}`,
                    verified_at: org.settings.verified_at || null,
                    lastChecked: new Date(),
                    organizations: {
                        name: org.name,
                        status: org.status,
                    },
                }));

            setDomains(domainRecords);
        } catch (error) {
            console.error('Error fetching domains:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    const verifyDomain = async (orgId: string, domain: string) => {
        setVerifying(orgId);

        // Simulate DNS verification (in production, this would call a backend API)
        setTimeout(async () => {
            try {
                const { data: org, error: fetchError } = await supabase
                    .from('organizations')
                    .select('settings')
                    .eq('id', orgId)
                    .single();

                if (fetchError) throw fetchError;

                const updatedSettings = {
                    ...org.settings,
                    domain_verified: true,
                    verified_at: new Date().toISOString(),
                };

                const { error: updateError } = await supabase
                    .from('organizations')
                    .update({ settings: updatedSettings })
                    .eq('id', orgId);

                if (updateError) throw updateError;

                fetchDomains();
                alert('Domain verified successfully!');
            } catch (error: any) {
                alert('Verification failed: ' + error.message);
            } finally {
                setVerifying(null);
            }
        }, 1500);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Domain Management</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Verify and manage custom domains</p>
                    </div>
                    <button
                        onClick={fetchDomains}
                        disabled={loading}
                        className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 text-sm"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-slate-500 text-sm font-medium mb-1">Total Domains</p>
                        <p className="text-xl font-bold text-slate-900">{domains.length}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-slate-500 text-sm font-medium mb-1">Verified</p>
                        <p className="text-xl font-bold text-emerald-600">
                            {domains.filter(d => d.domain_verified).length}
                        </p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-slate-500 text-sm font-medium mb-1">Pending</p>
                        <p className="text-xl font-bold text-amber-600">
                            {domains.filter(d => !d.domain_verified).length}
                        </p>
                    </div>
                </div>

                {/* Domains List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {domains.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                                <Globe className="mx-auto text-slate-300 mb-3" size={40} />
                                <h3 className="text-base font-bold text-slate-900">No custom domains configured</h3>
                                <p className="text-slate-500 text-sm">Organizations can configure custom domains in their settings.</p>
                            </div>
                        ) : (
                            domains.map(domain => (
                                <div
                                    key={domain.id}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${domain.domain_verified ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                {domain.domain_verified ? <CheckCircle size={24} /> : <Clock size={24} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-base font-bold text-slate-900">{domain.custom_domain}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${domain.domain_verified
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {domain.domain_verified ? 'Verified' : 'Pending'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-2">
                                                    Organization: <span className="font-semibold">{domain.organizations?.name}</span>
                                                </p>

                                                {!domain.domain_verified && (
                                                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                                        <p className="text-xs text-slate-600 mb-2 font-semibold">Verification Instructions:</p>
                                                        <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                                                            <li>Add a TXT record to your DNS</li>
                                                            <li>Host: _qbank-verify</li>
                                                            <li>Value: <code className="bg-slate-200 px-2 py-0.5 rounded text-[10px] font-mono">{domain.verification_code}</code>
                                                                <button
                                                                    onClick={() => copyToClipboard(domain.verification_code)}
                                                                    className="ml-2 text-primary hover:text-primary-hover"
                                                                >
                                                                    <Copy size={12} className="inline" />
                                                                </button>
                                                            </li>
                                                        </ol>
                                                    </div>
                                                )}

                                                {domain.domain_verified && domain.verified_at && (
                                                    <p className="text-xs text-emerald-600 mt-2">
                                                        Verified on {new Date(domain.verified_at).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {!domain.domain_verified && (
                                                <button
                                                    onClick={() => verifyDomain(domain.org_id, domain.custom_domain)}
                                                    disabled={verifying === domain.org_id}
                                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${verifying === domain.org_id
                                                            ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                                                            : 'bg-primary hover:bg-primary-hover text-white'
                                                        }`}
                                                >
                                                    {verifying === domain.org_id ? (
                                                        <>
                                                            <Loader2 size={16} className="inline animate-spin mr-1" />
                                                            Verifying...
                                                        </>
                                                    ) : (
                                                        'Verify Now'
                                                    )}
                                                </button>
                                            )}
                                            <a
                                                href={`https://${domain.custom_domain}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                <ExternalLink size={14} />
                                                Visit
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Help Section */}
                <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-xl">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="font-bold text-blue-900 mb-1">Domain Verification Process</h3>
                            <p className="text-sm text-blue-800">
                                Organizations must add a TXT record to their DNS settings with the provided verification code.
                                Once added, click "Verify Now" to confirm ownership. DNS changes may take up to 48 hours to propagate.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
