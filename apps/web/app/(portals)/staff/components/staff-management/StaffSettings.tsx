'use client';

import { useState } from 'react';
import { useApi } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import {
  Settings, Bell, Shield, Palette, Globe, Clock,
  Database, RefreshCw, Download, Upload, Users,
  Building2, ToggleLeft, Sliders
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

export function StaffSettings() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';

  const settingsHook = useApi(() => workforceApi.getStaffSettings(orgId), [orgId], !!orgId);
  const settings = (settingsHook.data?.data || settingsHook.data || {}) as any;

  return (
    <div>
      <div className="page-header">
        <h1>Staff Settings</h1>
        <p>Configure workforce management preferences, notifications, and system settings.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-2xl">
          <TabsTrigger value="general" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Settings size={14} className="mr-1" /> General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Bell size={14} className="mr-1" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Clock size={14} className="mr-1" /> Attendance
          </TabsTrigger>
          <TabsTrigger value="permissions" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Shield size={14} className="mr-1" /> Access Control
          </TabsTrigger>
          <TabsTrigger value="data" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Database size={14} className="mr-1" /> Data Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5 border-gray-100">
              <h3 className="text-sm font-bold mb-4">Organization Settings</h3>
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 font-medium">Organization ID</span>
                  <span className="font-bold text-gray-900 font-mono text-[10px]">{orgId || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 font-medium">Multi-language Support</span>
                  <select className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold outline-none bg-white">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Marathi</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 font-medium">Time Zone</span>
                  <select className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold outline-none bg-white">
                    <option>Asia/Kolkata (UTC+5:30)</option>
                    <option>Asia/Dubai (UTC+4:00)</option>
                    <option>America/New_York (UTC-5:00)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 font-medium">Date Format</span>
                  <select className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold outline-none bg-white">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
              <Button className="mt-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold"
                onClick={() => toast.success('Settings saved')}>
                Save Settings
              </Button>
            </Card>

            <Card className="p-5 border-gray-100">
              <h3 className="text-sm font-bold mb-4">Theme & Display</h3>
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 font-medium">Dark Mode</span>
                  <div className="relative w-10 h-5 rounded-full bg-gray-300 cursor-pointer">
                    <div className="absolute w-4 h-4 rounded-full bg-white shadow top-0.5 left-0.5" />
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 font-medium">Compact Layout</span>
                  <div className="relative w-10 h-5 rounded-full bg-gray-300 cursor-pointer">
                    <div className="absolute w-4 h-4 rounded-full bg-white shadow top-0.5 left-0.5" />
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 font-medium">Sidebar Collapsed</span>
                  <div className="relative w-10 h-5 rounded-full bg-gray-300 cursor-pointer">
                    <div className="absolute w-4 h-4 rounded-full bg-white shadow top-0.5 left-0.5" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-5 border-gray-100">
            <h3 className="text-sm font-bold mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              {[
                'Leave Request Notifications',
                'Task Assignment Alerts',
                'Attendance Reminders',
                'Performance Review Notifications',
                'Announcement Broadcasts',
                'Document Verification Updates',
                'Payroll Processing Alerts',
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className="text-xs font-semibold text-gray-700">{item}</span>
                  <div className="relative w-10 h-5 rounded-full bg-purple-500 cursor-pointer">
                    <div className="absolute w-4 h-4 rounded-full bg-white shadow top-0.5 left-5" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card className="p-5 border-gray-100">
            <h3 className="text-sm font-bold mb-4">Attendance Configuration</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 font-medium">Auto-mark Absent After</span>
                <select className="px-3 py-1.5 rounded-lg border border-gray-200 font-semibold outline-none bg-white">
                  <option>30 minutes late</option>
                  <option>1 hour late</option>
                  <option>2 hours late</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 font-medium">Half-day After</span>
                <select className="px-3 py-1.5 rounded-lg border border-gray-200 font-semibold outline-none bg-white">
                  <option>4 hours</option>
                  <option>5 hours</option>
                  <option>6 hours</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 font-medium">Working Days</span>
                <span className="text-gray-900 font-bold">Monday - Saturday</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 font-medium">Biometric Integration</span>
                <Badge className="bg-green-50 text-green-700 border-green-200 text-[9px] font-extrabold">Connected</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card className="p-5 border-gray-100">
            <h3 className="text-sm font-bold mb-4">Access Control</h3>
            <div className="space-y-3">
              {[
                { label: 'Allow Self-Registration', enabled: false },
                { label: 'Require Admin Approval for New Staff', enabled: true },
                { label: 'Allow Department Head Permissions', enabled: true },
                { label: 'Enable Staff Self-Service', enabled: true },
                { label: 'Restrict Data Export', enabled: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                  <div className={`relative w-10 h-5 rounded-full cursor-pointer ${item.enabled ? 'bg-purple-500' : 'bg-gray-300'}`}>
                    <div className={`absolute w-4 h-4 rounded-full bg-white shadow top-0.5 transition-all ${item.enabled ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5 border-gray-100">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <Download size={16} className="text-purple-500" /> Export Data
              </h3>
              <p className="text-xs text-gray-500 mb-4">Export staff data, attendance, and reports</p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start rounded-xl text-xs border-gray-200">
                  <Download size={12} className="mr-2" /> Export Staff Directory
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl text-xs border-gray-200">
                  <Download size={12} className="mr-2" /> Export Attendance Records
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl text-xs border-gray-200">
                  <Download size={12} className="mr-2" /> Export Payroll Data
                </Button>
              </div>
            </Card>
            <Card className="p-5 border-gray-100">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <Upload size={16} className="text-purple-500" /> Import Data
              </h3>
              <p className="text-xs text-gray-500 mb-4">Bulk import staff data from CSV/Excel</p>
              <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                <div>
                  <Upload size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400 font-semibold">Drop files here or click to browse</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
