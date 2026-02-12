'use client';

import React, { useState, useEffect } from 'react';
import { 
  Ticket, Plus, Search, Filter, Loader2, 
  Tag, Calendar, Percent, DollarSign,
  MoreVertical, Edit2, Trash2, CheckCircle2,
  XCircle, Copy, Check
} from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { supabase } from '../../../lib/supabase';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_purchase?: number;
  expiry_date: string;
  is_active: boolean;
  usage_count: number;
  max_usage?: number;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Discount Coupons</h1>
            <p className="text-slate-500">Create and manage promotional offers for your courses.</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200">
            <Plus size={18} />
            Create New Coupon
          </button>
        </div>

        {/* Coupons List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-orange-600 mb-4" size={40} />
            <p className="text-slate-500 animate-pulse">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Ticket size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No active coupons</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              Promote your courses by creating discount codes for your students.
            </p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all">
              Create Coupon
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col relative">
                {/* Decorative cutouts for ticket look */}
                <div className="absolute top-1/2 -left-2 w-4 h-4 bg-slate-50 rounded-full border border-slate-200 -translate-y-1/2"></div>
                <div className="absolute top-1/2 -right-2 w-4 h-4 bg-slate-50 rounded-full border border-slate-200 -translate-y-1/2"></div>
                
                <div className="p-6 border-b border-dashed border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <span className="text-3xl font-black text-orange-600">
                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OFF DISCOUNT</span>
                    </div>
                    <button 
                      onClick={() => handleCopy(coupon.code)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        copiedCode === coupon.code 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {copiedCode === coupon.code ? <Check size={14} /> : <Copy size={14} />}
                      {coupon.code}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={14} />
                    Expires: {new Date(coupon.expiry_date).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-6 bg-slate-50/50 flex-1">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Used</div>
                      <div className="text-lg font-bold text-slate-900">{coupon.usage_count} <span className="text-xs text-slate-400 font-normal">/ {coupon.max_usage || '∞'}</span></div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Min. Order</div>
                      <div className="text-lg font-bold text-slate-900">${coupon.min_purchase || 0}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      coupon.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex gap-1">
                      <button className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
