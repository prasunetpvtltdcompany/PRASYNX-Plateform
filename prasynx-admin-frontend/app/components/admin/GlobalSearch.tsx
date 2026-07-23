'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Building2, Users, FileText, Settings, Key, UserCheck, GraduationCap,
  Briefcase, Globe, Activity, ArrowUpRight, ExternalLink, Filter, Clock,
  ChevronRight, Sparkles, Target, BookOpen, School, HelpCircle, TrendingUp,
  BarChart3, Award, Shield, Database, Mail, Phone, MapPin, CalendarDays,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', accent: '#A855F7' };

const categories = [
  { key: 'all', label: 'All Results', icon: Target },
  { key: 'organizations', label: 'Organizations', icon: Building2 },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'credentials', label: 'Credentials', icon: Key },
  { key: 'analytics', label: 'Reports', icon: BarChart3 },
];

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showResults, setShowResults] = useState(false);

  const filteredOrgs: any[] = [];
  const filteredUsers: any[] = [];
  const filteredCreds: any[] = [];
  const filteredReports: any[] = [];

  const totalResults = filteredOrgs.length + filteredUsers.length + filteredCreds.length + filteredReports.length;

  return (
    <div>
      {/* Hero */}
      <div className="hero-section relative overflow-hidden rounded-3xl p-6 md:p-8 xl:p-8 mb-8 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.2)] min-h-[320px] md:min-h-[340px] xl:h-[360px] xl:max-h-[360px] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[45%] bg-[#A855F7]/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[50%] bg-[#3B82F6]/15 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-white/10 text-white border border-white/10 text-[10px] flex items-center gap-1.5">
              <Sparkles size={12} /> AI-Powered Search
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl xl:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight">
            Global Search
          </h1>
          <p className="text-xs md:text-sm text-white/80 max-w-2xl leading-relaxed mb-4">
            Search across all organizations, users, credentials, reports, and platform resources with AI-powered results.
          </p>

          {/* Search Bar */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md max-w-2xl">
            <Search size={18} className="text-white/60" />
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setShowResults(e.target.value.length > 0); }}
              placeholder="Search organizations, users, credentials, reports..."
              className="bg-transparent border-none outline-none text-sm text-white flex-1 placeholder-white/40"
            />
            <Badge className="bg-white/10 text-white border border-white/10 text-[9px] flex items-center gap-1">
              <Sparkles size={10} /> AI
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Clock size={11} className="text-white/50" />
            <span className="text-[10px] text-white/50">Try: "Greenfield" "Sarah Chen" "Enterprise plans" "Active credentials"</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat.key
                  ? 'bg-[#6D4CFF] text-white shadow-[0_4px_12px_rgba(109,76,255,0.3)]'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#6D4CFF] hover:text-[#6D4CFF]'
              }`}>
              <Icon size={14} />{cat.label}
            </button>
          );
        })}
      </div>

      {!showResults ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Building2, label: 'Organizations', desc: 'Find schools, institutions, and academies', count: '1,248', color: COLORS.primary },
            { icon: Users, label: 'Users', desc: 'Search students, staff, parents, admins', count: '125,248', color: COLORS.success },
            { icon: Key, label: 'Credentials', desc: 'Look up issued credentials and access keys', count: '45,200', color: COLORS.warning },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Card key={i} className="p-6 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `${item.color}15`, color: item.color }}><Icon size={24} /></div>
                <h3 className="text-sm font-bold mb-1">{item.label}</h3>
                <p className="text-[11px] text-gray-400 mb-3">{item.desc}</p>
                <div className="text-2xl font-extrabold" style={{ color: item.color }}>{item.count}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">total records</div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div>
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-500">
              Found <span className="font-semibold text-gray-900">{totalResults}</span> results for "<span className="font-semibold text-gray-900">{query}</span>"
            </p>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-gray-200 transition-all"><Filter size={12} /> Filters</button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-gray-200 transition-all"><ExternalLink size={12} /> Export</button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Organizations */}
            {filteredOrgs.length > 0 && (activeCategory === 'all' || activeCategory === 'organizations') && (
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold flex items-center gap-2"><Building2 size={14} className="text-[#6D4CFF]" /> Organizations</h3>
                  <button className="text-[#6D4CFF] text-[10px] font-semibold hover:underline">View all ({filteredOrgs.length})</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead><tr><th>Name</th><th>Owner</th><th>Users</th><th>Plan</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                    <tbody>
                      {filteredOrgs.map(org => (
                        <tr key={org.id}>
                          <td className="font-medium text-xs">{org.name}</td>
                          <td className="text-xs text-gray-600">{org.owner}</td>
                          <td className="text-xs font-medium">{org.users.toLocaleString()}</td>
                          <td><span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">{org.plan}</span></td>
                          <td><Badge variant="success" className="text-[9px]">{org.status}</Badge></td>
                          <td className="text-right">
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><ExternalLink size={13} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Users */}
            {filteredUsers.length > 0 && (activeCategory === 'all' || activeCategory === 'users') && (
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold flex items-center gap-2"><Users size={14} className="text-[#22C55E]" /> Users</h3>
                  <button className="text-[#6D4CFF] text-[10px] font-semibold hover:underline">View all ({filteredUsers.length})</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Portal</th><th>Organization</th><th className="text-right">Actions</th></tr></thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-7 h-7"><div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white text-[9px] font-bold rounded-full">{user.avatar}</div></Avatar>
                              <span className="text-xs font-semibold">{user.name}</span>
                            </div>
                          </td>
                          <td className="text-xs text-gray-600">{user.email}</td>
                          <td><span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">{user.role}</span></td>
                          <td><Badge variant="info" className="text-[9px]">{user.portal}</Badge></td>
                          <td className="text-xs text-gray-600">{user.org}</td>
                          <td className="text-right">
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><ExternalLink size={13} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Credentials */}
            {filteredCreds.length > 0 && (activeCategory === 'all' || activeCategory === 'credentials') && (
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold flex items-center gap-2"><Key size={14} className="text-[#F59E0B]" /> Credentials</h3>
                  <button className="text-[#6D4CFF] text-[10px] font-semibold hover:underline">View all ({filteredCreds.length})</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead><tr><th>ID</th><th>Organization</th><th>Type</th><th>Issued To</th><th>Issued</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                    <tbody>
                      {filteredCreds.map(cred => (
                        <tr key={cred.id}>
                          <td><span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 rounded">{cred.id}</span></td>
                          <td className="text-xs font-medium">{cred.org}</td>
                          <td><span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">{cred.type}</span></td>
                          <td className="text-xs text-gray-600">{cred.issuedTo}</td>
                          <td className="text-xs text-gray-500">{cred.issued}</td>
                          <td><Badge variant="success" className="text-[9px]">{cred.status}</Badge></td>
                          <td className="text-right">
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><ExternalLink size={13} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Reports */}
            {filteredReports.length > 0 && (activeCategory === 'all' || activeCategory === 'analytics') && (
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold flex items-center gap-2"><BarChart3 size={14} className="text-[#3B82F6]" /> Reports & Analytics</h3>
                  <button className="text-[#6D4CFF] text-[10px] font-semibold hover:underline">View all ({filteredReports.length})</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead><tr><th>Name</th><th>Type</th><th>Date</th><th>Size</th><th className="text-right">Actions</th></tr></thead>
                    <tbody>
                      {filteredReports.map((r, i) => (
                        <tr key={i}>
                          <td className="text-xs font-medium">{r.name}</td>
                          <td><span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">{r.type}</span></td>
                          <td className="text-xs text-gray-500">{r.date}</td>
                          <td className="text-xs text-gray-500">{r.size}</td>
                          <td className="text-right">
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><ExternalLink size={13} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {totalResults === 0 && (
              <Card className="p-12 text-center">
                <Search size={40} className="mx-auto text-gray-200 mb-3" />
                <h3 className="text-sm font-semibold text-gray-500 mb-1">No results found</h3>
                <p className="text-xs text-gray-400">Try adjusting your search query or filters</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
