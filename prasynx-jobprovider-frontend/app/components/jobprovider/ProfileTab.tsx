'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Mail, Phone, Globe, MapPin, Save, Edit3,
  FileText, Camera, CheckCircle, AlertCircle,
} from 'lucide-react';
import apiClient from '../../lib/apiClient';

export default function ProfileTab({ provider }: { provider: any }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    company_name: '', contact_name: '', phone: '', website: '',
    description: '', location: '',
  });

  useEffect(() => {
    setLoading(true);
    apiClient.get<any>('/job-provider/profile').then(r => {
      if (r.success && r.data) {
        setProfile(r.data);
        setForm({
          company_name: r.data.company_name || '',
          contact_name: r.data.contact_name || '',
          phone: r.data.phone || '',
          website: r.data.website || '',
          description: r.data.description || '',
          location: r.data.location || '',
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const r = await apiClient.put('/job-provider/profile', form);
    setSaving(false);
    if (r.success) {
      setProfile(r.data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" /></div>;

  return (
    <div className="max-w-[1000px] mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Company Profile</h1>
          <p className="text-xs text-gray-400">Manage your organization details</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all">
            <Edit3 size={14} /> Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5a3ed9] disabled:opacity-50 transition-all">
              <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs">
          <CheckCircle size={16} className="text-green-500" /> Profile updated successfully
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-5 mb-8">
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-200">
              {(form.company_name || 'P')[0]}
              {editing && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-sm">
                  <Camera size={12} className="text-gray-500" />
                </div>
              )}
            </div>
            <div>
              {editing ? (
                <input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                  className="text-xl font-bold border-b-2 border-[#6D4CFF] focus:outline-none px-1 py-0.5" />
              ) : (
                <h2 className="text-xl font-bold">{profile?.company_name}</h2>
              )}
              <p className="text-xs text-gray-400 mt-0.5">Job Provider</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: Building2, label: 'Company Name', key: 'company_name' },
              { icon: Mail, label: 'Contact Name', key: 'contact_name' },
              { icon: Phone, label: 'Phone', key: 'phone' },
              { icon: Globe, label: 'Website', key: 'website' },
              { icon: MapPin, label: 'Location', key: 'location' },
            ].map((field) => (
              <div key={field.key} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1.5">
                  <field.icon size={12} /> {field.label}
                </div>
                {editing ? (
                  <input value={(form as any)[field.key] || ''} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full bg-transparent text-sm font-semibold focus:outline-none border-b border-dashed border-gray-300 focus:border-[#6D4CFF] pb-0.5" />
                ) : (
                  <div className="text-sm font-semibold">{(profile as any)?.[field.key] || 'Not set'}</div>
                )}
              </div>
            ))}
            <div className="md:col-span-2 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1.5">
                <FileText size={12} /> Description
              </div>
              {editing ? (
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-transparent text-sm focus:outline-none border border-dashed border-gray-300 focus:border-[#6D4CFF] rounded-lg p-2 min-h-[80px]" />
              ) : (
                <div className="text-sm text-gray-700">{profile?.description || 'No description provided'}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
