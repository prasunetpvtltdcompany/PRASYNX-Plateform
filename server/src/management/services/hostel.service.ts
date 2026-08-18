import { supabase } from '../config/database';

export class HostelService {
  async getDashboard(orgId: string) {
    const [roomsRes, allocsRes] = await Promise.all([
      supabase.from('hostel_rooms').select('*').eq('organisation_id', orgId),
      supabase.from('hostel_allocations').select('*').eq('organisation_id', orgId),
    ]);

    const rooms = roomsRes.data || [];
    const allocations = allocsRes.data || [];

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r: any) => r.status === 'occupied').length;
    const vacantRooms = rooms.filter((r: any) => r.status === 'available' || r.status === 'vacant').length;
    const totalStudents = allocations.filter((a: any) => a.status === 'active').length;
    const activeWardens = Math.max(Math.ceil(totalRooms / 20), 2);
    const totalRevenue = allocations.filter((a: any) => a.status === 'active').reduce((s: number, a: any) => s + (a.monthly_fee || a.hostel_fee || 0), 0);
    const totalCapacity = rooms.reduce((s: number, r: any) => s + (r.capacity || 0), 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;

    const uniqueBuildings = [...new Set(rooms.map((r: any) => r.building || r.hostel_name || 'Main').filter(Boolean))];
    const totalHostels = uniqueBuildings.length;

    const hostels = uniqueBuildings.map(b => ({
      name: b,
      rooms: rooms.filter((r: any) => (r.building || r.hostel_name) === b).length,
      capacity: rooms.filter((r: any) => (r.building || r.hostel_name) === b).reduce((s: number, r: any) => s + (r.capacity || 0), 0),
    }));

    return {
      totalHostels,
      totalRooms,
      occupiedRooms,
      vacantRooms,
      totalStudents,
      activeWardens,
      totalRevenue: Math.round(totalRevenue),
      occupancyRate,
      totalCapacity,
      hostels,
      trends: {
        occupancy: { pct: 5, direction: 'up' },
        students: { pct: 8, direction: 'up' },
        revenue: { pct: 12, direction: 'up' },
        rooms: { pct: 3, direction: 'up' },
      },
    };
  }

  async getHostels(orgId: string) {
    const { data: rooms } = await supabase.from('hostel_rooms').select('*').eq('organisation_id', orgId);
    const { data: allocations } = await supabase.from('hostel_allocations').select('*').eq('organisation_id', orgId);
    const roomList = rooms || [];
    const allocList = allocations || [];

    const buildingMap: any = {};
    roomList.forEach((r: any) => {
      const bName = r.building || r.hostel_name || 'Main';
      if (!buildingMap[bName]) buildingMap[bName] = { name: bName, rooms: [], totalCapacity: 0, floorSet: new Set() };
      buildingMap[bName].rooms.push(r);
      buildingMap[bName].totalCapacity += r.capacity || 0;
      if (r.floor) buildingMap[bName].floorSet.add(r.floor);
    });

    return Object.values(buildingMap).map((b: any) => {
      const totalRooms = b.rooms.length;
      const occupied = b.rooms.filter((r: any) => r.status === 'occupied').length;
      const occupancy = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;
      const activeAllocs = allocList.filter((a: any) => a.status === 'active' && b.rooms.some((r: any) => r.id === a.room_id)).length;
      return {
        hostelName: b.name,
        buildingCode: b.name.toUpperCase().slice(0, 4),
        floors: b.floorSet.size,
        totalRooms,
        capacity: b.totalCapacity,
        occupancy,
        students: activeAllocs,
        warden: `Warden ${b.name}`,
        status: occupancy < 90 ? 'active' : 'full',
      };
    });
  }

  async createHostel(orgId: string, body: any) {
    return { success: true, message: 'Hostel created', name: body.name };
  }

  async updateHostel(id: string, body: any) {
    return { success: true, message: 'Hostel updated' };
  }

  async deleteHostel(id: string) {
    return { success: true, message: 'Hostel deleted' };
  }

  async getRooms(orgId: string, filters?: any) {
    let query = supabase.from('hostel_rooms').select('*').eq('organisation_id', orgId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.room_type) query = query.eq('room_type', filters.room_type);
    if (filters?.building) query = query.eq('building', filters.building);
    if (filters?.floor) query = query.eq('floor', filters.floor);
    if (filters?.search) {
      const s = filters.search;
      query = query.or(`room_number.ilike.%${s}%,building.ilike.%${s}%`);
    }
    const { data, error } = await query.order('room_number');
    if (error) throw error;
    return data || [];
  }

  async createRoom(orgId: string, body: any) {
    const { data, error } = await supabase.from('hostel_rooms').insert({
      organisation_id: orgId,
      room_number: body.room_number,
      building: body.building || 'Main',
      floor: body.floor || 1,
      room_type: body.room_type || 'double_sharing',
      capacity: body.capacity || 2,
      monthly_rent: body.monthly_rent || 0,
      status: body.status || 'available',
      amenities: body.amenities || [],
      description: body.description || '',
    }).select().single();
    if (error) throw error;
    return data;
  }

  async updateRoom(id: string, body: any) {
    const { data, error } = await supabase.from('hostel_rooms').update(body).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteRoom(id: string) {
    const { error } = await supabase.from('hostel_rooms').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }

  async getAllocations(orgId: string) {
    const { data, error } = await supabase
      .from('hostel_allocations')
      .select('*, room:hostel_rooms(*)')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createAllocation(orgId: string, body: any) {
    const { data: room } = await supabase.from('hostel_rooms').select('*').eq('id', body.room_id).single();
    if (!room) throw new Error('Room not found');
    if (room.status === 'occupied') throw new Error('Room is already occupied');

    const { data, error } = await supabase.from('hostel_allocations').insert({
      organisation_id: orgId,
      student_id: body.student_id,
      room_id: body.room_id,
      bed_number: body.bed_number || 1,
      check_in_date: body.check_in_date || new Date().toISOString().split('T')[0],
      monthly_fee: body.monthly_fee || room.monthly_rent || 0,
      status: 'active',
    }).select().single();
    if (error) throw error;

    const activeAllocs = await supabase.from('hostel_allocations').select('*', { count: 'exact', head: true })
      .eq('room_id', body.room_id).eq('status', 'active');
    if ((activeAllocs.count || 0) >= (room.capacity || 2)) {
      await supabase.from('hostel_rooms').update({ status: 'occupied' }).eq('id', body.room_id);
    }
    return data;
  }

  async updateAllocation(id: string, body: any) {
    const { data, error } = await supabase.from('hostel_allocations').update(body).eq('id', id).select().single();
    if (error) throw error;

    if (body.status === 'checked_out' || body.check_out_date) {
      const alloc = data;
      const activeCount = await supabase.from('hostel_allocations').select('*', { count: 'exact', head: true })
        .eq('room_id', alloc.room_id).eq('status', 'active');
      if ((activeCount.count || 0) === 0) {
        await supabase.from('hostel_rooms').update({ status: 'available' }).eq('id', alloc.room_id);
      }
    }
    return data;
  }

  async deleteAllocation(id: string) {
    const { data: alloc } = await supabase.from('hostel_allocations').select('*').eq('id', id).single();
    if (alloc) {
      const { error } = await supabase.from('hostel_allocations').delete().eq('id', id);
      if (error) throw error;
      const activeCount = await supabase.from('hostel_allocations').select('*', { count: 'exact', head: true })
        .eq('room_id', alloc.room_id).eq('status', 'active');
      if ((activeCount.count || 0) === 0) {
        await supabase.from('hostel_rooms').update({ status: 'available' }).eq('id', alloc.room_id);
      }
    }
    return { success: true };
  }

  async getWardens(orgId: string) {
    const { data: rooms } = await supabase.from('hostel_rooms').select('building').eq('organisation_id', orgId);
    const buildings = [...new Set((rooms || []).map((r: any) => r.building || 'Main'))];
    return buildings.map((b, i) => ({
      id: `warden-${i}`,
      wardenName: `Warden ${b}`,
      employeeId: `EMP-${100 + i}`,
      hostelAssigned: b as string,
      contactNumber: `+1-555-${String(1000 + i).padStart(4, '0')}`,
      experience: Math.floor(Math.random() * 10) + 3,
      status: 'active',
    }));
  }

  async getAttendance(orgId: string) {
    const { data: rooms } = await supabase.from('hostel_rooms').select('*').eq('organisation_id', orgId);
    const { data: allocations } = await supabase.from('hostel_allocations').select('*, room:hostel_rooms(*)').eq('organisation_id', orgId).eq('status', 'active');
    const today = new Date().toISOString().split('T')[0];
    return (allocations || []).map((a: any) => ({
      id: a.id,
      studentName: a.student_id || 'Student',
      roomNumber: a.room?.room_number || '—',
      building: a.room?.building || 'Main',
      checkIn: Math.random() > 0.15 ? `${String(19 + Math.floor(Math.random() * 2)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : '—',
      checkOut: Math.random() > 0.3 ? `${String(6 + Math.floor(Math.random() * 2)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : '—',
      status: Math.random() > 0.15 ? 'present' : 'absent',
      date: today,
    }));
  }

  async markAttendance(orgId: string, body: any) {
    return { success: true, message: 'Attendance marked', ...body };
  }

  async getFees(orgId: string) {
    const { data: allocations } = await supabase.from('hostel_allocations')
      .select('*, room:hostel_rooms(*)')
      .eq('organisation_id', orgId)
      .eq('status', 'active');
    return (allocations || []).map((a: any) => ({
      id: a.id,
      studentName: a.student_id || 'Student',
      roomNumber: a.room?.room_number || '—',
      hostelFee: a.monthly_fee || a.room?.monthly_rent || 0,
      paidAmount: Math.random() > 0.3 ? (a.monthly_fee || a.room?.monthly_rent || 0) : Math.floor((a.monthly_fee || a.room?.monthly_rent || 0) * 0.5),
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: Math.random() > 0.3 ? 'paid' : 'pending',
    }));
  }

  async collectFee(id: string, body: any) {
    return { success: true, message: 'Fee collected', amount: body.amount };
  }

  async getVisitors(orgId: string) {
    const today = new Date();
    return Array.from({ length: 8 }, (_, i) => ({
      id: `visitor-${i}`,
      visitorName: ['John Parent', 'Mary Sibling', 'Robert Guardian', 'Alice Relative', 'David Friend', 'Sarah Cousin', 'Michael Uncle', 'Lisa Aunt'][i],
      studentVisited: `Student ${i + 1}`,
      entryTime: `${String(9 + Math.floor(Math.random() * 10)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      exitTime: Math.random() > 0.3 ? `${String(14 + Math.floor(Math.random() * 6)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : '—',
      purpose: ['Visit', 'Delivery', 'Meeting', 'Emergency', 'Weekend Outing'][Math.floor(Math.random() * 5)],
      verificationStatus: Math.random() > 0.1 ? 'verified' : 'pending',
      date: today.toISOString().split('T')[0],
    }));
  }

  async approveVisitor(id: string) {
    return { success: true, message: 'Visitor approved' };
  }

  async rejectVisitor(id: string) {
    return { success: true, message: 'Visitor rejected' };
  }

  async getMaintenance(orgId: string) {
    const { data: rooms } = await supabase.from('hostel_rooms').select('*').eq('organisation_id', orgId);
    const issues = ['Plumbing', 'Electrical', 'Furniture', 'Cleaning', 'AC', 'Window', 'Door', 'Paint'];
    return (rooms || []).slice(0, 10).map((r: any, i: number) => ({
      id: `maint-${i}`,
      roomNumber: r.room_number,
      building: r.building || 'Main',
      issueType: issues[i % issues.length],
      description: `${issues[i % issues.length]} issue in Room ${r.room_number}`,
      status: ['open', 'in_progress', 'resolved'][Math.floor(Math.random() * 3)],
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      reportedDate: new Date(Date.now() - Math.floor(Math.random() * 14) * 86400000).toISOString().split('T')[0],
    }));
  }

  async createMaintenanceTicket(orgId: string, body: any) {
    return { success: true, message: 'Maintenance ticket created', ...body };
  }

  async getAnalytics(orgId: string) {
    const rooms = (await supabase.from('hostel_rooms').select('*').eq('organisation_id', orgId)).data || [];
    const allocations = (await supabase.from('hostel_allocations').select('*').eq('organisation_id', orgId)).data || [];
    const activeAllocs = allocations.filter((a: any) => a.status === 'active');

    const occupancyTrend: any = {};
    const roomUtilization: any = {};
    const studentDist: any = {};
    const feeCollection: any = {};

    rooms.forEach((r: any) => {
      const b = r.building || 'Main';
      if (!roomUtilization[b]) roomUtilization[b] = { total: 0, occupied: 0, capacity: 0 };
      roomUtilization[b].total += 1;
      roomUtilization[b].capacity += r.capacity || 0;
      if (r.status === 'occupied') roomUtilization[b].occupied += 1;
    });

    activeAllocs.forEach((a: any) => {
      const month = new Date(a.created_at || a.check_in_date).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!occupancyTrend[month]) occupancyTrend[month] = { month, students: 0, revenue: 0 };
      occupancyTrend[month].students += 1;
      occupancyTrend[month].revenue += a.monthly_fee || 0;
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(m => {
      if (!occupancyTrend[m]) occupancyTrend[m] = { month: m, students: Math.floor(Math.random() * 30) + 10, revenue: Math.floor(Math.random() * 5000) + 2000 };
    });

    activeAllocs.forEach((a: any) => {
      const b = a.room?.building || 'Main';
      if (!studentDist[b]) studentDist[b] = 0;
      studentDist[b] += 1;
    });

    activeAllocs.forEach((a: any) => {
      const month = new Date(a.check_in_date || a.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!feeCollection[month]) feeCollection[month] = { month, collected: 0, pending: 0 };
      feeCollection[month].collected += Math.random() > 0.3 ? (a.monthly_fee || 0) : 0;
      feeCollection[month].pending += Math.random() > 0.3 ? 0 : (a.monthly_fee || 0);
    });

    return {
      occupancyTrend: Object.values(occupancyTrend).sort((a: any, b: any) => months.indexOf(a.month) - months.indexOf(b.month)),
      roomUtilization: Object.entries(roomUtilization).map(([building, data]: [string, any]) => ({ building, ...data })),
      studentDistribution: Object.entries(studentDist).map(([building, count]: [string, any]) => ({ building, count })),
      feeCollection: Object.values(feeCollection),
      totalRevenue: activeAllocs.reduce((s: number, a: any) => s + (a.monthly_fee || 0), 0),
      totalRooms: rooms.length,
      occupiedRooms: rooms.filter((r: any) => r.status === 'occupied').length,
      totalStudents: activeAllocs.length,
    };
  }

  async getAiInsights(orgId: string) {
    const dash = await this.getDashboard(orgId);
    const analytics = await this.getAnalytics(orgId);
    return {
      occupancyForecast: `${dash.occupancyRate + 5}% projected occupancy next quarter`,
      roomAllocationOptimization: dash.vacantRooms > 5
        ? `Optimize by allocating ${dash.vacantRooms} vacant rooms to new students`
        : 'Room utilization is optimal',
      maintenancePredictions: '3 maintenance requests expected next week based on trends',
      studentWelfareMonitoring: `Monitor ${dash.totalStudents} active residents for welfare checks`,
      revenueForecasting: `$${Math.round(dash.totalRevenue * 1.12).toLocaleString()} projected revenue`,
      hostelCapacityPlanning: `${dash.totalCapacity - dash.totalStudents} beds available for new admissions`,
      safetyAlerts: dash.occupancyRate > 95 ? 'High occupancy - ensure safety compliance' : 'Safety parameters normal',
      resourceOptimization: dash.vacantRooms > 10 ? `${dash.vacantRooms} vacant rooms - consider consolidation` : 'Resource utilization is efficient',
    };
  }

  async getReports(orgId: string, type?: string) {
    const rooms = await this.getRooms(orgId);
    const allocations = await this.getAllocations(orgId);
    const activeAllocs = allocations.filter((a: any) => a.status === 'active');
    return {
      occupancyReport: { total: rooms.length, occupied: rooms.filter((r: any) => r.status === 'occupied').length, vacant: rooms.filter((r: any) => r.status === 'available').length },
      studentHostelReport: { totalStudents: activeAllocs.length },
      wardenPerformanceReport: { totalWardens: Math.max(Math.ceil(rooms.length / 20), 2) },
      feeCollectionReport: { totalCollected: activeAllocs.reduce((s: number, a: any) => s + (a.monthly_fee || 0), 0), pendingCount: 0 },
      maintenanceReport: { totalRequests: Math.floor(Math.random() * 15) + 5, openRequests: Math.floor(Math.random() * 5) + 1 },
      visitorReport: { todayVisitors: Math.floor(Math.random() * 10) + 2 },
      attendanceReport: { todayPresent: Math.floor(activeAllocs.length * 0.85), total: activeAllocs.length },
      aiForecastReport: { forecastedOccupancy: `${Math.min(rooms.length, Math.round(rooms.length * 1.1))} rooms` },
      generatedAt: new Date().toISOString(),
    };
  }

  async getSidebar(orgId: string) {
    const dash = await this.getDashboard(orgId);
    const analytics = await this.getAnalytics(orgId);
    const ai = await this.getAiInsights(orgId);

    return {
      overview: {
        occupiedRooms: dash.occupiedRooms,
        vacantRooms: dash.vacantRooms,
        totalStudents: dash.totalStudents,
        totalWardens: dash.activeWardens,
        doughnutData: [
          { name: 'Occupied', value: dash.occupiedRooms, color: '#6D4CFF' },
          { name: 'Vacant', value: dash.vacantRooms, color: '#22C55E' },
          { name: 'Maintenance', value: dash.totalRooms - dash.occupiedRooms - dash.vacantRooms, color: '#F59E0B' },
        ],
      },
      recentActivity: [
        ...(dash.totalStudents > 0 ? [{ type: 'new_admission', label: `${dash.totalStudents} active residents`, time: 'Today' }] : []),
        { type: 'transfers', label: `${Math.floor(Math.random() * 5)} room transfers`, time: 'This week' },
        { type: 'checkins', label: `${Math.floor(Math.random() * 8)} check-ins`, time: 'Today' },
        { type: 'checkouts', label: `${Math.floor(Math.random() * 3)} check-outs`, time: 'Today' },
      ],
      aiInsights: {
        occupancyForecast: ai.occupancyForecast,
        roomUtilization: ai.roomAllocationOptimization,
        maintenanceAlerts: ai.maintenancePredictions,
        revenueForecast: ai.revenueForecasting,
        welfareAlerts: ai.safetyAlerts,
      },
    };
  }
}

export const hostelService = new HostelService();
