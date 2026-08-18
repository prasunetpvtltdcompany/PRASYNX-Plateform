'use client';

import { useState } from 'react';
import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Shield, ShieldCheck, ShieldOff, Users, Building2,
  Plus, Search, Lock, Unlock, CheckCircle2, XCircle,
  Eye, EyeOff, Settings, Key
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

const featureModules = [
  'Staff Directory', 'Attendance', 'Work Assignments', 'Departments',
  'Designations', 'Academic Assignments', 'Performance', 'Leave',
  'Tasks', 'Training', 'Documents', 'Payroll', 'Communication',
  'Analytics', 'Roles', 'Staff Requests', 'Lifecycle', 'Settings'
];

export function RolesPermissions() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';
  const [activeTab, setLocalTab] = useState('roles');

  const rolesHook = useApi(() => workforceApi.getRoles(orgId), [orgId], !!orgId);
  const permsHook = useApi(() => workforceApi.getPermissions(orgId), [orgId], !!orgId);

  const roles = Array.isArray(rolesHook.data?.data || rolesHook.data) ? (rolesHook.data?.data || rolesHook.data) : [];
  const permissions = (permsHook.data?.data || permsHook.data || {}) as any;

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [rolePerms, setRolePerms] = useState<Record<string, boolean>>({});

  return (
    <div>
      <div className="page-header">
        <h1>Roles & Permissions</h1>
        <p>Dynamic role system with granular permission mapping and feature access control.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setLocalTab} className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-2xl">
          <TabsTrigger value="roles" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Shield size={14} className="mr-1" /> Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Key size={14} className="mr-1" /> Permissions
          </TabsTrigger>
          <TabsTrigger value="mapping" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Users size={14} className="mr-1" /> Role Mapping
          </TabsTrigger>
          <TabsTrigger value="custom" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Settings size={14} className="mr-1" /> Custom Roles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800">System Roles</h3>
            <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
              <Plus size={14} className="mr-1" /> Create Role
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {roles.length > 0 ? roles.map((role: any, i: number) => (
              <motion.div key={role.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => { setSelectedRole(role.id || role.name); setRolePerms(role.permissions || {}); }}
                className={`bg-white rounded-2xl border p-5 hover:shadow-lg transition-all cursor-pointer ${
                  selectedRole === (role.id || role.name) ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-100'
                }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    {role.is_custom ? <Settings size={18} /> : <ShieldCheck size={18} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{role.name}</h4>
                    <Badge className={`text-[9px] font-extrabold ${role.is_custom ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                      {role.is_custom ? 'Custom' : 'System'}
                    </Badge>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{role.description || `${role.name} role with specific permissions`}</div>
                <div className="text-[10px] text-gray-400 mt-3">{role.staff_count || role.user_count || 0} staff assigned</div>
              </motion.div>
            )) : (
              <>
                {['Principal', 'Vice Principal', 'HOD', 'Teacher', 'Accountant', 'Admin'].map((r, i) => (
                  <motion.div key={r} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedRole(r)}
                    className={`bg-white rounded-2xl border p-5 hover:shadow-lg transition-all cursor-pointer ${
                      selectedRole === r ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-100'
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <ShieldCheck size={18} />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">{r}</h4>
                    </div>
                    <div className="text-[10px] text-gray-400">{r} role permissions</div>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          {selectedRole ? (
            <Card className="p-5 border-gray-100">
              <h3 className="text-sm font-bold mb-4">Permission Mapping: <span className="text-purple-600">{selectedRole}</span></h3>
              <div className="space-y-1">
                {featureModules.map(mod => {
                  const key = mod.toLowerCase().replace(/\s+/g, '_');
                  const enabled = rolePerms[key] !== false;
                  return (
                    <div key={key} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <span className="text-xs font-semibold text-gray-700">{mod}</span>
                      <button onClick={() => setRolePerms(prev => ({ ...prev, [key]: !enabled }))}
                        className={`relative w-10 h-5 rounded-full transition-all ${enabled ? 'bg-purple-500' : 'bg-gray-300'}`}>
                        <div className={`absolute w-4 h-4 rounded-full bg-white shadow top-0.5 transition-all ${enabled ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <Button className="mt-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold"
                onClick={() => toast.success('Permissions updated')}>
                Save Permissions
              </Button>
            </Card>
          ) : (
            <Card className="p-5 border-gray-100">
              <div className="text-center py-12 text-gray-400">
                <Lock size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-semibold">Select a role to manage permissions</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mapping">
          <Card className="p-5 border-gray-100">
            <h3 className="text-sm font-bold mb-4">Role to Staff Mapping</h3>
            <div className="text-center py-12 text-gray-400">
              <Users size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-semibold">Assign roles to staff members</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card className="p-5 border-gray-100">
            <h3 className="text-sm font-bold mb-4">Custom Roles</h3>
            <div className="text-center py-12 text-gray-400">
              <Settings size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-semibold">Create custom roles with tailored permissions</p>
              <Button className="mt-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
                <Plus size={14} className="mr-1" /> Create Custom Role
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
