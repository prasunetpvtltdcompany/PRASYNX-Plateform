'use client';

import { useState } from 'react';
import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  BadgeCheck, Users, Plus, Search, Building2, Briefcase,
  School, Music, Palette, Monitor, Truck, Shield, Heart,
  Home, BookOpen, DollarSign, UserCheck, Headphones, Wrench
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const designationsList = [
  { name: 'Principal', icon: BadgeCheck, category: 'academic' },
  { name: 'Vice Principal', icon: BadgeCheck, category: 'academic' },
  { name: 'Academic Coordinator', icon: BookOpen, category: 'academic' },
  { name: 'HOD', icon: Users, category: 'academic' },
  { name: 'Teacher', icon: BookOpen, category: 'academic' },
  { name: 'Assistant Teacher', icon: BookOpen, category: 'academic' },
  { name: 'Lab Instructor', icon: Monitor, category: 'academic' },
  { name: 'Computer Teacher', icon: Monitor, category: 'academic' },
  { name: 'Sports Coach', icon: Briefcase, category: 'academic' },
  { name: 'Music Teacher', icon: Music, category: 'academic' },
  { name: 'Dance Teacher', icon: Palette, category: 'academic' },
  { name: 'Art Teacher', icon: Palette, category: 'academic' },
  { name: 'Librarian', icon: BookOpen, category: 'support' },
  { name: 'Accountant', icon: DollarSign, category: 'admin' },
  { name: 'Receptionist', icon: Headphones, category: 'admin' },
  { name: 'Admission Officer', icon: UserCheck, category: 'admin' },
  { name: 'HR Manager', icon: Users, category: 'admin' },
  { name: 'IT Administrator', icon: Monitor, category: 'admin' },
  { name: 'Bus Driver', icon: Truck, category: 'transport' },
  { name: 'Transport Manager', icon: Truck, category: 'transport' },
  { name: 'Security Guard', icon: Shield, category: 'support' },
  { name: 'Nurse', icon: Heart, category: 'support' },
  { name: 'Housekeeping Staff', icon: Wrench, category: 'support' },
  { name: 'Store Manager', icon: Briefcase, category: 'admin' },
  { name: 'Hostel Warden', icon: Home, category: 'support' },
];

const categories = [
  { key: 'all', label: 'All Designations' },
  { key: 'academic', label: 'Academic' },
  { key: 'admin', label: 'Administrative' },
  { key: 'support', label: 'Support' },
  { key: 'transport', label: 'Transport' },
];

export function Designations() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const designationsHook = useApi(() => workforceApi.getDesignations(orgId), [orgId], !!orgId);
  const existingDesignations = Array.isArray(designationsHook.data?.data || designationsHook.data) ? (designationsHook.data?.data || designationsHook.data) : [];

  const allDesignations = existingDesignations.length > 0 ? existingDesignations : designationsList;

  const filtered = allDesignations.filter((d: any) => {
    const name = d.name || d.designation_name || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || d.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getIcon = (name: string) => {
    const found = designationsList.find(d => d.name.toLowerCase() === name?.toLowerCase());
    return found?.icon || BadgeCheck;
  };

  const getCount = (name: string) => {
    const found = existingDesignations.find((d: any) => (d.name || d.designation_name)?.toLowerCase() === name?.toLowerCase());
    return found?.staff_count || found?.count || 0;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Designations</h1>
        <p>Manage staff designations, roles, and position hierarchy.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search designations..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat.key ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>
        <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold ml-auto">
          <Plus size={14} className="mr-1" /> New Designation
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filtered.map((des: any, i: number) => {
          const name = des.name || des.designation_name || '';
          const Icon = getIcon(name);
          return (
            <motion.div key={des.id || name || i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
              className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-100 transition-colors">
                <Icon size={22} />
              </div>
              <h3 className="text-xs font-bold text-gray-900 mb-1 truncate">{name}</h3>
              <Badge className="bg-gray-50 text-gray-500 border-gray-200 text-[9px] font-extrabold">
                {getCount(name)} staff
              </Badge>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
