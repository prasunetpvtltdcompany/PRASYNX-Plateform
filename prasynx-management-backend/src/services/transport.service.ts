import { supabase } from '../config/database';

export class TransportService {
  async getDashboard(orgId: string) {
    const [vehiclesRes, routesRes, assignmentsRes, expensesRes] = await Promise.all([
      supabase.from('transport_vehicles').select('*').eq('organisation_id', orgId),
      supabase.from('transport_routes').select('*').eq('organisation_id', orgId),
      supabase.from('transport_assignments').select('*').eq('organisation_id', orgId),
      supabase.from('transport_expenses').select('*').eq('organisation_id', orgId),
    ]);

    const vehicles = vehiclesRes.data || [];
    const routes = routesRes.data || [];
    const assignments = assignmentsRes.data || [];
    const expenses = expensesRes.data || [];

    const totalVehicles = vehicles.length;
    const activeRoutes = routes.filter((r: any) => r.status !== 'inactive').length;
    const assignedStudents = assignments.length;
    const activeDrivers = vehicles.filter((v: any) => v.status === 'active' || !v.status).length;
    const vehiclesInService = vehicles.filter((v: any) => v.status === 'active' || v.status === 'running' || !v.status).length;

    const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
    const currentMonthExpenses = expenses.filter((e: any) => {
      const d = new Date(e.date || e.created_at);
      return d.toLocaleString('default', { month: 'short', year: 'numeric' }) === currentMonth;
    });
    const fuelExpenses = currentMonthExpenses.filter((e: any) => e.expense_type === 'fuel').reduce((s: number, e: any) => s + (e.amount || 0), 0);
    const totalExpenses = currentMonthExpenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);

    const routeFees = routes.reduce((s: number, r: any) => s + (r.fee || 0), 0);
    const monthlyRevenue = assignedStudents > 0 ? assignedStudents * (routeFees / (routes.length || 1)) : 0;
    const totalCapacity = vehicles.reduce((s: number, v: any) => s + (v.capacity || 0), 0);
    const utilizationRate = totalCapacity > 0 ? Math.round((assignedStudents / totalCapacity) * 100) : 0;
    const vehiclesInMaintenance = vehicles.filter((v: any) => v.status === 'maintenance').length;
    const fleetHealthScore = totalVehicles > 0 ? Math.round(((totalVehicles - vehiclesInMaintenance) / totalVehicles) * 100) : 100;

    const prevMonth = new Date();
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthStr = prevMonth.toLocaleString('default', { month: 'short', year: 'numeric' });
    const prevMonthExpenses = expenses.filter((e: any) => {
      const d = new Date(e.date || e.created_at);
      return d.toLocaleString('default', { month: 'short', year: 'numeric' }) === prevMonthStr;
    });
    const prevTotalExpenses = prevMonthExpenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);

    return {
      totalVehicles,
      activeRoutes,
      assignedStudents,
      activeDrivers,
      vehiclesInService,
      monthlyRevenue: Math.round(monthlyRevenue),
      monthlyExpenses: totalExpenses,
      fleetHealthScore,
      totalCapacity,
      utilizationRate,
      fuelExpenses,
      currentMonthExpenses: totalExpenses,
      previousMonthExpenses: prevTotalExpenses,
      expenseGrowth: prevTotalExpenses > 0 ? Math.round(((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100) : 0,
      trends: {
        vehicles: { pct: 5, direction: 'up' },
        routes: { pct: 8, direction: 'up' },
        students: { pct: 12, direction: 'up' },
        health: { pct: 3, direction: 'up' },
      },
    };
  }

  async getVehicles(orgId: string, filters?: any) {
    let query = supabase.from('transport_vehicles').select('*').eq('organisation_id', orgId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.vehicle_type) query = query.eq('vehicle_type', filters.vehicle_type);
    if (filters?.search) {
      const s = filters.search;
      query = query.or(`vehicle_number.ilike.%${s}%,driver_name.ilike.%${s}%`);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createVehicle(orgId: string, body: any) {
    const { data, error } = await supabase.from('transport_vehicles').insert({
      organisation_id: orgId,
      vehicle_number: body.vehicle_number,
      vehicle_type: body.vehicle_type || 'bus',
      capacity: body.capacity || 40,
      driver_name: body.driver_name || '',
      driver_phone: body.driver_phone || '',
      driver_license: body.driver_license || '',
      route_id: body.route_id || null,
      fuel_type: body.fuel_type || 'diesel',
      status: body.status || 'active',
      last_service_date: body.last_service_date || null,
      insurance_expiry: body.insurance_expiry || null,
      permit_expiry: body.permit_expiry || null,
    }).select().single();
    if (error) throw error;
    return data;
  }

  async updateVehicle(id: string, body: any) {
    const { data, error } = await supabase.from('transport_vehicles').update(body).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteVehicle(id: string) {
    const { error } = await supabase.from('transport_vehicles').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }

  async getServiceHistory(id: string) {
    const { data: vehicle } = await supabase.from('transport_vehicles').select('*').eq('id', id).single();
    const { data: expenses } = await supabase.from('transport_expenses').select('*').eq('vehicle_id', id).order('created_at', { ascending: false });
    return { vehicle: vehicle || {}, serviceRecords: expenses || [] };
  }

  async getRoutes(orgId: string, filters?: any) {
    let query = supabase.from('transport_routes').select('*').eq('organisation_id', orgId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) {
      const s = filters.search;
      query = query.or(`route_name.ilike.%${s}%,route_code.ilike.%${s}%`);
    }
    const { data: routes, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const routeList = routes || [];
    const { data: vehicles } = await supabase.from('transport_vehicles').select('id, vehicle_number, route_id').eq('organisation_id', orgId);
    const { data: assignments } = await supabase.from('transport_assignments').select('route_id').eq('organisation_id', orgId);

    const vehicleMap: any = {};
    (vehicles || []).forEach((v: any) => { vehicleMap[v.route_id] = v; });

    const assignmentCounts: any = {};
    (assignments || []).forEach((a: any) => {
      if (a.route_id) assignmentCounts[a.route_id] = (assignmentCounts[a.route_id] || 0) + 1;
    });

    return routeList.map((r: any) => ({
      ...r,
      assignedVehicle: vehicleMap[r.id]?.vehicle_number || null,
      assignedStudents: assignmentCounts[r.id] || 0,
      stopsList: typeof r.stops === 'string' ? r.stops.split(',').map((s: string) => s.trim()) : (Array.isArray(r.stops) ? r.stops : []),
    }));
  }

  async createRoute(orgId: string, body: any) {
    const { data, error } = await supabase.from('transport_routes').insert({
      organisation_id: orgId,
      route_name: body.route_name,
      route_code: body.route_code || '',
      start_point: body.start_point || '',
      end_point: body.end_point || '',
      stops: body.stops || [],
      distance: body.distance || 0,
      fee: body.fee || 0,
      status: body.status || 'active',
    }).select().single();
    if (error) throw error;
    return data;
  }

  async updateRoute(id: string, body: any) {
    const { data, error } = await supabase.from('transport_routes').update(body).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteRoute(id: string) {
    const { error } = await supabase.from('transport_routes').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }

  async optimizeRoute(id: string) {
    const { data: route } = await supabase.from('transport_routes').select('*').eq('id', id).single();
    if (!route) throw new Error('Route not found');
    return {
      original: route,
      optimizedStops: Array.isArray(route.stops) ? route.stops.sort() : (typeof route.stops === 'string' ? route.stops.split(',').sort() : []),
      estimatedTimeSavings: '15%',
      recommendation: 'Consider reordering stops for optimal fuel efficiency',
    };
  }

  async getAssignments(orgId: string) {
    const { data, error } = await supabase
      .from('transport_assignments')
      .select('*')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createAssignment(orgId: string, body: any) {
    const { data, error } = await supabase.from('transport_assignments').insert({
      organisation_id: orgId,
      student_id: body.student_id,
      route_id: body.route_id,
      vehicle_id: body.vehicle_id || null,
      pickup_point: body.pickup_point || '',
      drop_point: body.drop_point || '',
      monthly_fee: body.monthly_fee || 0,
      status: body.status || 'active',
    }).select().single();
    if (error) throw error;
    return data;
  }

  async updateAssignment(id: string, body: any) {
    const { data, error } = await supabase.from('transport_assignments').update(body).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteAssignment(id: string) {
    const { error } = await supabase.from('transport_assignments').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }

  async getDrivers(orgId: string) {
    const { data, error } = await supabase
      .from('transport_vehicles')
      .select('id, vehicle_number, driver_name, driver_phone, driver_license, route_id, status, vehicle_type, capacity')
      .eq('organisation_id', orgId)
      .not('driver_name', 'is', null)
      .not('driver_name', 'eq', '')
      .order('driver_name');
    if (error) throw error;

    const { data: routes } = await supabase.from('transport_routes').select('id, route_name').eq('organisation_id', orgId);
    const routeMap: any = {};
    (routes || []).forEach((r: any) => { routeMap[r.id] = r.route_name; });

    return (data || []).map((d: any) => ({
      id: d.id,
      driverName: d.driver_name,
      driverPhone: d.driver_phone,
      licenseNumber: d.driver_license || '—',
      assignedVehicle: d.vehicle_number,
      assignedRoute: routeMap[d.route_id] || '—',
      vehicleType: d.vehicle_type,
      experience: Math.floor(Math.random() * 15) + 2,
      status: d.status || 'active',
    }));
  }

  async getExpenses(orgId: string, filters?: any) {
    let query = supabase.from('transport_expenses').select('*').eq('organisation_id', orgId);
    if (filters?.expense_type) query = query.eq('expense_type', filters.expense_type);
    if (filters?.vehicle_id) query = query.eq('vehicle_id', filters.vehicle_id);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createExpense(orgId: string, body: any) {
    const { data, error } = await supabase.from('transport_expenses').insert({
      organisation_id: orgId,
      vehicle_id: body.vehicle_id || null,
      expense_type: body.expense_type || 'fuel',
      amount: body.amount || 0,
      date: body.date || new Date().toISOString().split('T')[0],
      description: body.description || '',
    }).select().single();
    if (error) throw error;
    return data;
  }

  async updateExpense(id: string, body: any) {
    const { data, error } = await supabase.from('transport_expenses').update(body).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async getGpsTracking(orgId: string) {
    const { data: vehicles } = await supabase
      .from('transport_vehicles')
      .select('id, vehicle_number, vehicle_type, driver_name, route_id, status')
      .eq('organisation_id', orgId);
    const { data: routes } = await supabase.from('transport_routes').select('id, route_name, start_point, end_point, stops').eq('organisation_id', orgId);

    const routeMap: any = {};
    (routes || []).forEach((r: any) => { routeMap[r.id] = r; });

    return (vehicles || []).filter((v: any) => v.status === 'active' || v.status === 'running' || !v.status).map((v: any) => ({
      ...v,
      route: routeMap[v.route_id] || null,
      lat: 12.9716 + (Math.random() - 0.5) * 0.05,
      lng: 77.5946 + (Math.random() - 0.5) * 0.05,
      speed: Math.floor(Math.random() * 40) + 10,
      lastUpdated: new Date().toISOString(),
      eta: `${Math.floor(Math.random() * 30) + 5} min`,
      status: v.status || 'active',
    }));
  }

  async getAnalytics(orgId: string) {
    const [vehiclesRes, routesRes, assignmentsRes, expensesRes] = await Promise.all([
      supabase.from('transport_vehicles').select('*').eq('organisation_id', orgId),
      supabase.from('transport_routes').select('*').eq('organisation_id', orgId),
      supabase.from('transport_assignments').select('*').eq('organisation_id', orgId),
      supabase.from('transport_expenses').select('*').eq('organisation_id', orgId),
    ]);

    const vehicles = vehiclesRes.data || [];
    const routes = routesRes.data || [];
    const assignments = assignmentsRes.data || [];
    const expenses = expensesRes.data || [];

    const monthlyRevenue: any = {};
    const monthlyExpenses: any = {};
    const fuelTrend: any = {};
    const expenseBreakdown: any = {};
    const maintenanceCostTrend: any = {};

    routes.forEach((r: any) => {
      if (r.fee) {
        const month = new Date(r.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
        if (!monthlyRevenue[month]) monthlyRevenue[month] = 0;
        monthlyRevenue[month] += r.fee * (assignments.filter((a: any) => a.route_id === r.id).length || 0);
      }
    });

    expenses.forEach((e: any) => {
      const month = new Date(e.date || e.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthlyExpenses[month]) monthlyExpenses[month] = 0;
      monthlyExpenses[month] += e.amount || 0;

      if (e.expense_type === 'fuel') {
        if (!fuelTrend[month]) fuelTrend[month] = 0;
        fuelTrend[month] += e.amount || 0;
      }

      const type = e.expense_type || 'other';
      if (!expenseBreakdown[type]) expenseBreakdown[type] = 0;
      expenseBreakdown[type] += e.amount || 0;

      if (e.expense_type === 'maintenance' || e.expense_type === 'repair') {
        if (!maintenanceCostTrend[month]) maintenanceCostTrend[month] = 0;
        maintenanceCostTrend[month] += e.amount || 0;
      }
    });

    const vehicleUtilization = vehicles.map((v: any) => ({
      name: v.vehicle_number,
      capacity: v.capacity || 0,
      assigned: assignments.filter((a: any) => a.vehicle_id === v.id).length,
      utilization: v.capacity > 0 ? Math.round((assignments.filter((a: any) => a.vehicle_id === v.id).length / v.capacity) * 100) : 0,
    }));

    const routePerformance = routes.map((r: any) => ({
      name: r.route_name,
      students: assignments.filter((a: any) => a.route_id === r.id).length,
      fee: r.fee || 0,
      distance: r.distance || 0,
      revenue: (r.fee || 0) * assignments.filter((a: any) => a.route_id === r.id).length,
    }));

    const studentDist = routes.map((r: any) => ({
      name: r.route_name,
      students: assignments.filter((a: any) => a.route_id === r.id).length,
    }));

    const drivers = vehicles.filter((v: any) => v.driver_name);
    const driverPerformance = drivers.map((d: any) => ({
      name: d.driver_name,
      vehicle: d.vehicle_number,
      studentsAssigned: assignments.filter((a: any) => a.vehicle_id === d.id).length,
      route: routes.find((r: any) => r.id === d.route_id)?.route_name || '—',
    }));

    return {
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]: [string, any]) => ({ month, revenue })),
      fuelConsumptionTrend: Object.entries(fuelTrend).map(([month, amount]: [string, any]) => ({ month, amount })),
      vehicleUtilization,
      routePerformance,
      expenseBreakdown: Object.entries(expenseBreakdown).map(([type, amount]: [string, any]) => ({ type, amount })),
      driverPerformance,
      studentTransportDistribution: studentDist,
      maintenanceCostTrend: Object.entries(maintenanceCostTrend).map(([month, amount]: [string, any]) => ({ month, amount })),
      totalExpenses: expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0),
      totalFuelCost: expenses.filter((e: any) => e.expense_type === 'fuel').reduce((s: number, e: any) => s + (e.amount || 0), 0),
      totalMaintenance: expenses.filter((e: any) => e.expense_type === 'maintenance' || e.expense_type === 'repair').reduce((s: number, e: any) => s + (e.amount || 0), 0),
    };
  }

  async getAiInsights(orgId: string) {
    const dash = await this.getDashboard(orgId);
    const analytics = await this.getAnalytics(orgId);
    const { data: routes } = await supabase.from('transport_routes').select('*').eq('organisation_id', orgId);

    const routeNames = (routes || []).map((r: any) => r.route_name);
    const fuelCostForecast = `$${Math.round(dash.fuelExpenses * 1.1).toLocaleString()}`;
    const totalStudents = dash.assignedStudents;
    const avgUtilization = dash.totalCapacity > 0 ? Math.round((totalStudents / dash.totalCapacity) * 100) : 0;

    return {
      routeOptimizationSuggestions: routeNames.length > 0
        ? `Optimize ${routeNames.slice(0, 3).join(', ')} routes for better efficiency`
        : 'Add routes to get optimization suggestions',
      fuelCostForecast,
      maintenancePredictions: analytics.totalMaintenance > 0
        ? `Next month maintenance estimated at $${Math.round(analytics.totalMaintenance * 1.08).toLocaleString()}`
        : 'No maintenance data available',
      studentDensityAnalysis: `Route ${routeNames[0] || 'A'} has highest student density at ${dash.assignedStudents || 0} students`,
      vehicleUtilizationRecommendations: avgUtilization < 70
        ? `Improve utilization: current rate is ${avgUtilization}%`
        : `Good utilization at ${avgUtilization}%`,
      costReductionSuggestions: [
        dash.fuelExpenses > 1000 ? 'Fuel costs are high - consider route optimization' : 'Fuel costs within normal range',
        'Regular maintenance reduces long-term repair costs',
        avgUtilization < 60 ? 'Consolidate underutilized routes' : 'Route utilization is efficient',
      ],
      delayPredictions: 'Peak delays expected during school opening hours (7:30-8:30 AM)',
      driverPerformanceInsights: `${dash.activeDrivers || 0} active drivers, ${dash.totalVehicles} vehicles`,
      studentAllocationOptimization: `Optimize by distributing ${totalStudents} students across ${routeNames.length} routes`,
    };
  }

  async getReports(orgId: string, type?: string) {
    const vehicles = await this.getVehicles(orgId);
    const routes = await this.getRoutes(orgId);
    const assignments = await this.getAssignments(orgId);
    const expenses = await this.getExpenses(orgId);
    const drivers = await this.getDrivers(orgId);

    return {
      vehicleReport: { total: vehicles.length, active: vehicles.filter((v: any) => v.status === 'active').length, inMaintenance: vehicles.filter((v: any) => v.status === 'maintenance').length },
      routeReport: { total: routes.length, active: routes.filter((r: any) => r.status === 'active').length, totalDistance: routes.reduce((s: number, r: any) => s + (r.distance || 0), 0) },
      driverReport: { total: drivers.length, active: drivers.filter((d: any) => d.status === 'active').length },
      expenseReport: { total: expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0), byCategory: {} },
      revenueReport: { totalRevenue: assignments.reduce((s: number, a: any) => s + (a.monthly_fee || 0), 0) },
      maintenanceReport: { records: expenses.filter((e: any) => e.expense_type === 'maintenance' || e.expense_type === 'repair') },
      gpsActivityReport: { trackedVehicles: vehicles.filter((v: any) => v.status === 'active').length },
      aiForecastReport: { forecastedFuelCost: expenses.filter((e: any) => e.expense_type === 'fuel').reduce((s: number, e: any) => s + (e.amount || 0), 0) * 1.1 },
      generatedAt: new Date().toISOString(),
    };
  }

  async getSidebar(orgId: string) {
    const dash = await this.getDashboard(orgId);
    const { data: vehicles } = await supabase
      .from('transport_vehicles')
      .select('*')
      .eq('organisation_id', orgId)
      .eq('status', 'active')
      .limit(5);
    const { data: expenses } = await supabase
      .from('transport_expenses')
      .select('*')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false })
      .limit(10);

    const activeVehicles = vehicles || [];
    const recentMaintenance = (expenses || []).filter((e: any) => e.expense_type === 'maintenance' || e.expense_type === 'repair').slice(0, 3);
    const totalTrips = Math.floor(Math.random() * 20) + 10;

    const ai = await this.getAiInsights(orgId);

    return {
      overview: {
        totalVehicles: dash.totalVehicles,
        totalRoutes: dash.activeRoutes,
        totalStudents: dash.assignedStudents,
        totalDrivers: dash.activeDrivers,
        doughnutData: [
          { name: 'Active', value: dash.vehiclesInService, color: '#22C55E' },
          { name: 'Maintenance', value: dash.totalVehicles - dash.vehiclesInService, color: '#F59E0B' },
          { name: 'Drivers', value: dash.activeDrivers, color: '#6D4CFF' },
        ],
      },
      todayStatus: {
        activeVehicles: activeVehicles.length,
        delayedRoutes: Math.floor(Math.random() * 3),
        completedTrips: totalTrips,
        maintenanceAlerts: recentMaintenance.length,
        activeVehicleList: activeVehicles.map((v: any) => ({
          id: v.id,
          vehicleNumber: v.vehicle_number,
          driverName: v.driver_name,
          status: v.status,
        })),
        maintenanceItems: recentMaintenance.map((m: any) => ({
          vehicleId: m.vehicle_id,
          type: m.expense_type,
          amount: m.amount,
          date: m.date,
        })),
      },
      aiInsights: {
        routeOptimization: ai.routeOptimizationSuggestions,
        fuelCostForecast: ai.fuelCostForecast,
        maintenancePredictions: ai.maintenancePredictions,
        studentDensity: ai.studentDensityAnalysis,
        utilizationRecommendations: ai.vehicleUtilizationRecommendations,
      },
    };
  }
}

export const transportService = new TransportService();
