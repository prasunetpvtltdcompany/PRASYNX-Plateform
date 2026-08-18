'use client';

import { useState } from 'react';
import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  MessageSquare, Bell, Megaphone, FileText, Send,
  Users, Building2, Plus, Search, Filter, ChevronRight,
  Mail, Phone, CheckCircle2, Clock, AlertCircle, Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

export function CommunicationCenter() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';
  const [activeTab, setLocalTab] = useState('messages');

  const messagesHook = useApi(() => workforceApi.getMessages(orgId), [orgId], !!orgId);
  const announcementsHook = useApi(() => workforceApi.getAnnouncements(orgId), [orgId], !!orgId);
  const circularsHook = useApi(() => workforceApi.getCirculars(orgId), [orgId], !!orgId);

  const messages = Array.isArray(messagesHook.data?.data || messagesHook.data) ? (messagesHook.data?.data || messagesHook.data) : [];
  const announcements = Array.isArray(announcementsHook.data?.data || announcementsHook.data) ? (announcementsHook.data?.data || announcementsHook.data) : [];
  const circulars = Array.isArray(circularsHook.data?.data || circularsHook.data) ? (circularsHook.data?.data || circularsHook.data) : [];

  return (
    <div>
      <div className="page-header">
        <h1>Communication Center</h1>
        <p>Messages, announcements, circulars, and broadcasts for staff.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setLocalTab} className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-2xl">
          <TabsTrigger value="messages" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <MessageSquare size={14} className="mr-1" /> Messages
          </TabsTrigger>
          <TabsTrigger value="announcements" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Megaphone size={14} className="mr-1" /> Announcements
          </TabsTrigger>
          <TabsTrigger value="circulars" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <FileText size={14} className="mr-1" /> Circulars
          </TabsTrigger>
          <TabsTrigger value="broadcast" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Building2 size={14} className="mr-1" /> Broadcast
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-800">Recent Messages</h3>
                <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
                  <Plus size={14} className="mr-1" /> New Message
                </Button>
              </div>
              <div className="space-y-3">
                {messages.map((m: any, i: number) => (
                  <motion.div key={m.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-bold">
                          {m.sender_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-gray-900">{m.sender_name || 'System'}</h4>
                          <span className="text-[10px] text-gray-400">{m.created_at ? new Date(m.created_at).toLocaleDateString() : ''}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.message || m.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {messages.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <MessageSquare size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-semibold">No messages yet</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Card className="p-5 border-gray-100">
                <h3 className="text-sm font-bold mb-4">Quick Compose</h3>
                <div className="space-y-3">
                  <select className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold outline-none bg-white">
                    <option>Select Recipient</option>
                    <option>All Staff</option>
                    <option>Department</option>
                    <option>Individual</option>
                  </select>
                  <input type="text" placeholder="Subject" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none" />
                  <textarea placeholder="Type your message..." className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none h-24" />
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
                    <Send size={14} className="mr-1" /> Send
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="announcements">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800">Announcements</h3>
            <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
              <Plus size={14} className="mr-1" /> New Announcement
            </Button>
          </div>
          <div className="space-y-3">
            {announcements.map((a: any, i: number) => (
              <motion.div key={a.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <Megaphone size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-gray-900">{a.title}</h4>
                      <Badge className={`text-[9px] font-extrabold ${
                        a.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                        a.priority === 'important' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>{a.priority || 'Normal'}</Badge>
                    </div>
                    <p className="text-xs text-gray-600">{a.content}</p>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-2">
                      <span>{a.created_by_name || 'Admin'}</span>
                      <span>{a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {announcements.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Megaphone size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-semibold">No announcements yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="circulars">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800">Circulars</h3>
            <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
              <Plus size={14} className="mr-1" /> New Circular
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {circulars.map((c: any, i: number) => (
              <Card key={c.id || i} className="p-5 border-gray-100 hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <FileText size={20} className="text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{c.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{c.description || c.content}</p>
                    <div className="text-[10px] text-gray-400 mt-2">{c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}</div>
                  </div>
                </div>
              </Card>
            ))}
            {circulars.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-400">
                <FileText size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-semibold">No circulars yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="broadcast">
          <Card className="p-5 border-gray-100">
            <h3 className="text-sm font-bold mb-4">Department / Staff Broadcast</h3>
            <div className="text-center py-12 text-gray-400">
              <Building2 size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-semibold">Broadcast messages to departments or all staff</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
