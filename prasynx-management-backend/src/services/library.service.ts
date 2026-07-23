import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class LibraryService {
  async getDashboard(orgId: string) {
    const [booksRes, issuesRes, finesRes, membersRes, prevBooksRes, prevFinesRes] = await Promise.all([
      supabase.from('library_books').select('id, copies_total, copies_available, status, reserved_count, lost_count').eq('organisation_id', orgId),
      supabase.from('library_issues').select('id, status, fine_amount, fine_paid').eq('organisation_id', orgId),
      supabase.from('library_fines').select('amount, status').eq('organisation_id', orgId),
      supabase.from('library_members').select('id, status').eq('organisation_id', orgId),
      supabase.from('library_books').select('copies_total').eq('organisation_id', orgId).lte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
      supabase.from('library_fines').select('amount').eq('organisation_id', orgId).eq('status', 'paid').lte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
    ]);

    const books = booksRes.data || [];
    const issues = issuesRes.data || [];
    const fines = finesRes.data || [];
    const members = membersRes.data || [];
    const prevBooks = prevBooksRes.data || [];
    const prevFines = prevFinesRes.data || [];

    const totalBooks = books.reduce((s, b: any) => s + (b.copies_total || 0), 0);
    const availableBooks = books.reduce((s, b: any) => s + (b.copies_available || 0), 0);
    const issuedBooks = issues.filter((i: any) => i.status === 'issued' || i.status === 'overdue').length;
    const overdueBooks = issues.filter((i: any) => i.status === 'overdue').length;
    const lostBooks = books.reduce((s, b: any) => s + (b.lost_count || 0), 0);
    const reservedBooks = books.reduce((s, b: any) => s + (b.reserved_count || 0), 0);
    const activeMembers = members.filter((m: any) => m.status === 'active').length;
    const totalFinesCollected = fines.filter((f: any) => f.status === 'paid').reduce((s, f: any) => s + Number(f.amount), 0);
    const pendingFines = fines.filter((f: any) => f.status === 'pending').reduce((s, f: any) => s + Number(f.amount), 0);

    const prevTotal = prevBooks.reduce((s: number, b: any) => s + (b.copies_total || 0), 0);
    const prevFinesCollected = prevFines.reduce((s: number, f: any) => s + Number(f.amount), 0);
    const booksGrowth = prevTotal > 0 ? ((totalBooks - prevTotal) / prevTotal * 100).toFixed(1) : '0';
    const finesGrowth = prevFinesCollected > 0 ? ((totalFinesCollected - prevFinesCollected) / prevFinesCollected * 100).toFixed(1) : '0';

    const categoryDist = await this.getCategoryDistribution(orgId);
    const monthlyTrend = await this.getMonthlyIssueTrend(orgId);
    const topBooks = await this.getMostBorrowedBooks(orgId, 5);
    const recentActivity = await this.getRecentActivity(orgId, 10);

    return {
      summary: { totalBooks, availableBooks, issuedBooks, overdueBooks, lostBooks, reservedBooks, activeMembers, totalFinesCollected, pendingFines },
      trends: { booksGrowth, finesGrowth, issuedBooks, overdueBooks },
      categoryDistribution: categoryDist,
      monthlyIssueTrend: monthlyTrend,
      mostBorrowedBooks: topBooks,
      recentActivity,
    };
  }

  async getBooks(orgId: string, filters: any) {
    let query = supabase.from('library_books').select('*', { count: 'exact' }).eq('organisation_id', orgId);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.author) query = query.ilike('author', `%${filters.author}%`);
    if (filters.publisher) query = query.ilike('publisher', `%${filters.publisher}%`);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.search) query = query.or(`title.ilike.%${filters.search}%,isbn.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
    if (filters.rack_number) query = query.eq('rack_number', filters.rack_number);
    if (filters.language) query = query.eq('language', filters.language);
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count, error } = await query.range(from, to).order('title', { ascending: true });
    if (error) throw error;
    return { data: data || [], total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) };
  }

  async getBookById(bookId: string) {
    const { data, error } = await supabase.from('library_books').select('*').eq('id', bookId).single();
    if (error) throw error;
    return data;
  }

  async createBook(orgId: string, body: any) {
    const payload = { organisation_id: orgId, ...body };
    if (!payload.copies_total) payload.copies_total = 1;
    payload.copies_available = payload.copies_total;
    payload.status = 'active';
    const { data, error } = await supabase.from('library_books').insert(payload).select().single();
    if (error) throw error;
    await this.logActivity(orgId, 'book_added', 'library_books', data.id, null, { title: payload.title });
    return data;
  }

  async updateBook(bookId: string, body: any) {
    const { data, error } = await supabase.from('library_books').update(body).eq('id', bookId).select().single();
    if (error) throw error;
    return data;
  }

  async deleteBook(bookId: string) {
    const { error } = await supabase.from('library_books').delete().eq('id', bookId);
    if (error) throw error;
    return true;
  }

  async getIssues(orgId: string, filters: any) {
    let query = supabase.from('library_issues').select('*, book:library_books(*), member:library_members(*)', { count: 'exact' }).eq('organisation_id', orgId);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.book_id) query = query.eq('book_id', filters.book_id);
    if (filters.member_id) query = query.eq('issued_to_id', filters.member_id);
    if (filters.from) query = query.gte('issue_date', filters.from);
    if (filters.to) query = query.lte('issue_date', filters.to);
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count, error } = await query.range(from, to).order('issue_date', { ascending: false });
    if (error) throw error;
    return { data: data || [], total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) };
  }

  async issueBook(orgId: string, body: any) {
    const { book_id, issued_to_id, issued_to_type, issue_date, due_date, notes } = body;
    const { data: book, error: bookErr } = await supabase.from('library_books').select('id, copies_available, title').eq('id', book_id).single();
    if (bookErr || !book) throw new BadRequestError('Book not found');
    if (book.copies_available <= 0) throw new BadRequestError('No copies available');

    const memberPayload: any = { organisation_id: orgId, user_id: issued_to_id, member_type: issued_to_type, status: 'active' };
    let member = await this.findOrCreateMember(orgId, memberPayload);

    const { data, error } = await supabase.from('library_issues').insert({
      organisation_id: orgId, book_id, issued_to_id, issued_to_type, issue_date: issue_date || new Date().toISOString().split('T')[0],
      due_date, notes, status: 'issued', member_id: member.id,
    }).select('*, book:library_books(*), member:library_members(*)').single();
    if (error) throw error;

    await supabase.from('library_books').update({ copies_available: book.copies_available - 1 }).eq('id', book_id);
    await this.logActivity(orgId, 'book_issued', 'library_issues', data.id, member.id, { book_title: book.title, member_id: issued_to_id });
    return data;
  }

  async returnBook(issueId: string, body: any) {
    const { return_date, fine_amount, condition } = body;
    const rDate = return_date || new Date().toISOString().split('T')[0];
    const { data: issue, error: issueErr } = await supabase.from('library_issues').select('*, book:library_books(*)').eq('id', issueId).single();
    if (issueErr || !issue) throw new BadRequestError('Issue not found');
    if (issue.status === 'returned') throw new BadRequestError('Already returned');

    const dueDate = new Date(issue.due_date);
    const retDate = new Date(rDate);
    let fine = fine_amount || 0;
    if (retDate > dueDate && !fine) {
      const daysOverdue = Math.ceil((retDate.getTime() - dueDate.getTime()) / 86400000);
      fine = daysOverdue * 5;
    }

    const { data, error } = await supabase.from('library_issues').update({
      return_date: rDate, status: fine > 0 ? 'overdue' : 'returned', fine_amount: fine,
    }).eq('id', issueId).select('*, book:library_books(*), member:library_members(*)').single();
    if (error) throw error;

    if (fine > 0) {
      await supabase.from('library_fines').insert({
        organisation_id: issue.organisation_id, issue_id: issueId, member_id: issue.member_id,
        amount: fine, reason: 'Overdue', status: 'pending',
      });
    }

    await supabase.from('library_books').update({ copies_available: issue.book.copies_available + 1 }).eq('id', issue.book_id);
    await this.logActivity(issue.organisation_id, 'book_returned', 'library_issues', issueId, issue.member_id, { book_title: issue.book?.title, fine });
    return data;
  }

  async renewBook(issueId: string, extraDays: number = 14) {
    const { data: issue, error } = await supabase.from('library_issues').select('*').eq('id', issueId).single();
    if (error || !issue) throw new BadRequestError('Issue not found');
    if (issue.status === 'returned') throw new BadRequestError('Already returned');
    const currentDue = new Date(issue.due_date);
    const newDue = new Date(currentDue.getTime() + extraDays * 86400000);
    const { data, error: updErr } = await supabase.from('library_issues').update({
      due_date: newDue.toISOString().split('T')[0], renewed_count: (issue.renewed_count || 0) + 1,
    }).eq('id', issueId).select('*, book:library_books(*)').single();
    if (updErr) throw updErr;
    return data;
  }

  async sendReminder(issueId: string) {
    const { data: issue, error } = await supabase.from('library_issues').select('*, book:library_books(*), member:library_members(*)').eq('id', issueId).single();
    if (error || !issue) throw new BadRequestError('Issue not found');
    const { error: updErr } = await supabase.from('library_issues').update({ reminder_sent: true, reminder_sent_date: new Date().toISOString() }).eq('id', issueId);
    if (updErr) throw updErr;
    return { sent: true, member: issue.member, book: issue.book, due_date: issue.due_date };
  }

  async getMembers(orgId: string, filters: any) {
    let query = supabase.from('library_members').select('*', { count: 'exact' }).eq('organisation_id', orgId);
    if (filters.member_type) query = query.eq('member_type', filters.member_type);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.search) query = query.or(`full_name.ilike.%${filters.search}%,membership_id.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count, error } = await query.range(from, to).order('full_name', { ascending: true });
    if (error) throw error;
    const memberIds = (data || []).map((m: any) => m.id);
    let issuesMap: Record<string, number> = {};
    if (memberIds.length > 0) {
      const { data: issuesData } = await supabase.from('library_issues').select('member_id').in('member_id', memberIds).in('status', ['issued', 'overdue']);
      (issuesData || []).forEach((i: any) => { issuesMap[i.member_id] = (issuesMap[i.member_id] || 0) + 1; });
    }
    const enriched = (data || []).map((m: any) => ({ ...m, books_issued: issuesMap[m.id] || 0 }));
    return { data: enriched, total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) };
  }

  async getMemberById(memberId: string) {
    const { data, error } = await supabase.from('library_members').select('*').eq('id', memberId).single();
    if (error) throw error;
    const { data: issues } = await supabase.from('library_issues').select('*, book:library_books(*)').eq('member_id', memberId).order('issue_date', { ascending: false });
    const { data: fines } = await supabase.from('library_fines').select('*').eq('member_id', memberId).order('created_at', { ascending: false });
    return { ...data, issues: issues || [], fines: fines || [] };
  }

  async createMember(orgId: string, body: any) {
    const payload = { organisation_id: orgId, ...body };
    const { data, error } = await supabase.from('library_members').insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async updateMember(memberId: string, body: any) {
    const { data, error } = await supabase.from('library_members').update(body).eq('id', memberId).select().single();
    if (error) throw error;
    return data;
  }

  async suspendMember(memberId: string) {
    const { data, error } = await supabase.from('library_members').update({ status: 'suspended' }).eq('id', memberId).select().single();
    if (error) throw error;
    return data;
  }

  async getFines(orgId: string, filters: any) {
    let query = supabase.from('library_fines').select('*, issue:library_issues(*), member:library_members(*)', { count: 'exact' }).eq('organisation_id', orgId);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.member_id) query = query.eq('member_id', filters.member_id);
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count, error } = await query.range(from, to).order('created_at', { ascending: false });
    if (error) throw error;
    return { data: data || [], total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) };
  }

  async collectFine(fineId: string, body: any) {
    const { data, error } = await supabase.from('library_fines').update({
      status: 'paid', paid_date: new Date().toISOString(), payment_method: body.payment_method || 'cash',
    }).eq('id', fineId).select('*, member:library_members(*)').single();
    if (error) throw error;
    if (data.member) {
      const currentDue = Number(data.member.fine_due) || 0;
      await supabase.from('library_members').update({ fine_due: Math.max(0, currentDue - Number(data.amount)) }).eq('id', data.member_id);
    }
    await this.logActivity(data.organisation_id, 'fine_collected', 'library_fines', fineId, data.member_id, { amount: data.amount });
    return data;
  }

  async waiveFine(fineId: string) {
    const { data, error } = await supabase.from('library_fines').update({ status: 'waived' }).eq('id', fineId).select().single();
    if (error) throw error;
    return data;
  }

  async getReservations(orgId: string, bookId?: string) {
    let query = supabase.from('library_reservations').select('*, book:library_books(*), member:library_members(*)').eq('organisation_id', orgId);
    if (bookId) query = query.eq('book_id', bookId);
    const { data, error } = await query.order('reservation_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createReservation(orgId: string, body: any) {
    const { data, error } = await supabase.from('library_reservations').insert({ organisation_id: orgId, ...body }).select().single();
    if (error) throw error;
    const { data: book } = await supabase.from('library_books').select('reserved_count').eq('id', body.book_id).single();
    if (book) await supabase.from('library_books').update({ reserved_count: (book.reserved_count || 0) + 1 }).eq('id', body.book_id);
    return data;
  }

  async fulfillReservation(reservationId: string) {
    const { data: res, error: resErr } = await supabase.from('library_reservations').select('*').eq('id', reservationId).single();
    if (resErr || !res) throw new BadRequestError('Reservation not found');
    const { data, error } = await supabase.from('library_reservations').update({
      status: 'fulfilled', fulfilled_date: new Date().toISOString(),
    }).eq('id', reservationId).select().single();
    if (error) throw error;
    return data;
  }

  async cancelReservation(reservationId: string) {
    const { data: res, error: resErr } = await supabase.from('library_reservations').select('book_id').eq('id', reservationId).single();
    if (resErr || !res) throw new BadRequestError('Reservation not found');
    const { data, error } = await supabase.from('library_reservations').update({ status: 'cancelled' }).eq('id', reservationId).select().single();
    if (error) throw error;
    const { data: book } = await supabase.from('library_books').select('reserved_count').eq('id', res.book_id).single();
    if (book) await supabase.from('library_books').update({ reserved_count: Math.max(0, (book.reserved_count || 0) - 1) }).eq('id', res.book_id);
    return data;
  }

  async getAnalytics(orgId: string) {
    const [categoryDist, monthlyTrend, topBooks, fineTrend, availability, studentActivity, staffActivity, inventoryGrowth] = await Promise.all([
      this.getCategoryDistribution(orgId),
      this.getMonthlyIssueTrend(orgId),
      this.getMostBorrowedBooks(orgId, 10),
      this.getFineTrend(orgId),
      this.getAvailabilityAnalysis(orgId),
      this.getMemberActivity(orgId, 'student'),
      this.getMemberActivity(orgId, 'teacher'),
      this.getInventoryGrowth(orgId),
    ]);
    return { categoryDistribution: categoryDist, monthlyIssueTrend: monthlyTrend, mostBorrowedBooks: topBooks, fineTrend, availability, studentActivity, staffActivity, inventoryGrowth };
  }

  async getAiInsights(orgId: string) {
    const [mostBorrowed, lowStock, overdueTrends, recommendations, inventorySuggestions] = await Promise.all([
      this.getMostBorrowedBooks(orgId, 5),
      this.getLowStockBooks(orgId),
      this.getOverdueTrend(orgId),
      this.getReadingRecommendations(orgId),
      this.getInventorySuggestions(orgId),
    ]);
    return { mostBorrowed, lowStock, overdueTrends, recommendations, inventorySuggestions };
  }

  async getInventoryRecords(orgId: string, bookId?: string) {
    let query = supabase.from('library_inventory').select('*, book:library_books(*)').eq('organisation_id', orgId).order('inventory_date', { ascending: false });
    if (bookId) query = query.eq('book_id', bookId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createInventoryRecord(orgId: string, body: any) {
    const { data, error } = await supabase.from('library_inventory').insert({ organisation_id: orgId, ...body }).select().single();
    if (error) throw error;
    return data;
  }

  async verifyInventory(recordId: string, verifiedBy: string) {
    const { data: rec, error: recErr } = await supabase.from('library_inventory').select('*').eq('id', recordId).single();
    if (recErr || !rec) throw new BadRequestError('Record not found');
    const status = rec.expected_count === rec.actual_count ? 'verified' : 'discrepancy';
    const { data, error } = await supabase.from('library_inventory').update({
      status, verified_by: verifiedBy, verified_date: new Date().toISOString(),
    }).eq('id', recordId).select().single();
    if (error) throw error;
    if (rec.actual_count < rec.expected_count) {
      const diff = rec.expected_count - rec.actual_count;
      const { data: book } = await supabase.from('library_books').select('lost_count').eq('id', rec.book_id).single();
      if (book) await supabase.from('library_books').update({ lost_count: (book.lost_count || 0) + diff }).eq('id', rec.book_id);
    }
    return data;
  }

  async getReports(orgId: string, type: string, filters: any) {
    switch (type) {
      case 'inventory': {
        const { data } = await supabase.from('library_books').select('category, copies_total, copies_available, lost_count, damaged_count, status').eq('organisation_id', orgId);
        const books = data || [];
        return { totalBooks: books.length, totalCopies: books.reduce((s: number, b: any) => s + (b.copies_total || 0), 0),
          availableCopies: books.reduce((s: number, b: any) => s + (b.copies_available || 0), 0),
          lostCopies: books.reduce((s: number, b: any) => s + (b.lost_count || 0), 0),
          damagedCopies: books.reduce((s: number, b: any) => s + (b.damaged_count || 0), 0),
          categories: this.groupBy(books, 'category') };
      }
      case 'issue': {
        const { data } = await supabase.from('library_issues').select('*, book:library_books(title)').eq('organisation_id', orgId).order('issue_date', { ascending: false });
        return { issues: data || [], total: (data || []).length, active: (data || []).filter((i: any) => i.status === 'issued').length, returned: (data || []).filter((i: any) => i.status === 'returned').length };
      }
      case 'fine': {
        const { data } = await supabase.from('library_fines').select('*, member:library_members(full_name)').eq('organisation_id', orgId).order('created_at', { ascending: false });
        const totalCollected = (data || []).filter((f: any) => f.status === 'paid').reduce((s: number, f: any) => s + Number(f.amount), 0);
        const pending = (data || []).filter((f: any) => f.status === 'pending').reduce((s: number, f: any) => s + Number(f.amount), 0);
        return { fines: data || [], totalCollected, pending, count: (data || []).length };
      }
      case 'member-activity': {
        const { data: members } = await supabase.from('library_members').select('id, full_name, member_type').eq('organisation_id', orgId);
        const memberIds = (members || []).map((m: any) => m.id);
        const { data: issues } = await supabase.from('library_issues').select('member_id').in('member_id', memberIds.length > 0 ? memberIds : ['none']);
        const issueCount: Record<string, number> = {};
        (issues || []).forEach((i: any) => { issueCount[i.member_id] = (issueCount[i.member_id] || 0) + 1; });
        return (members || []).map((m: any) => ({ ...m, books_borrowed: issueCount[m.id] || 0 }));
      }
      case 'popularity': {
        return this.getMostBorrowedBooks(orgId, 20);
      }
      default:
        throw new BadRequestError('Unknown report type');
    }
  }

  async exportReport(orgId: string, type: string, format: string) {
    const data = await this.getReports(orgId, type, {});
    return { data, format, generatedAt: new Date().toISOString() };
  }

  private async getCategoryDistribution(orgId: string) {
    const { data } = await supabase.from('library_books').select('category, copies_total, copies_available').eq('organisation_id', orgId);
    const grouped: Record<string, { total: number; available: number; count: number }> = {};
    (data || []).forEach((b: any) => {
      const cat = b.category || 'Uncategorized';
      if (!grouped[cat]) grouped[cat] = { total: 0, available: 0, count: 0 };
      grouped[cat].total += b.copies_total || 0;
      grouped[cat].available += b.copies_available || 0;
      grouped[cat].count += 1;
    });
    return Object.entries(grouped).map(([name, stats]) => ({ name, ...stats }));
  }

  private async getMonthlyIssueTrend(orgId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const { data } = await supabase.from('library_issues').select('issue_date, status').eq('organisation_id', orgId).gte('issue_date', sixMonthsAgo.toISOString().split('T')[0]);
    const grouped: Record<string, { issued: number; returned: number }> = {};
    (data || []).forEach((i: any) => {
      const month = i.issue_date?.substring(0, 7);
      if (!month) return;
      if (!grouped[month]) grouped[month] = { issued: 0, returned: 0 };
      grouped[month].issued += 1;
      if (i.status === 'returned') grouped[month].returned += 1;
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([month, counts]) => ({ month, ...counts }));
  }

  private async getMostBorrowedBooks(orgId: string, limit: number) {
    const { data } = await supabase.from('library_issues').select('book_id, book:library_books(title, author, category)').eq('organisation_id', orgId);
    const countMap: Record<string, { count: number; title: string; author: string; category: string }> = {};
    (data || []).forEach((i: any) => {
      const bid = i.book_id;
      if (!bid) return;
      if (!countMap[bid]) countMap[bid] = { count: 0, title: i.book?.title || 'Unknown', author: i.book?.author || '', category: i.book?.category || '' };
      countMap[bid].count += 1;
    });
    return Object.entries(countMap).sort(([, a], [, b]) => b.count - a.count).slice(0, limit).map(([book_id, info]) => ({ book_id, ...info }));
  }

  private async getLowStockBooks(orgId: string) {
    const { data } = await supabase.from('library_books').select('id, title, author, copies_available, copies_total').eq('organisation_id', orgId).lte('copies_available', 2);
    return (data || []).map((b: any) => ({ ...b, status: b.copies_available === 0 ? 'out_of_stock' : 'low_stock' }));
  }

  private async getFineTrend(orgId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const { data } = await supabase.from('library_fines').select('amount, status, created_at').eq('organisation_id', orgId).gte('created_at', sixMonthsAgo.toISOString());
    const grouped: Record<string, { collected: number; pending: number }> = {};
    (data || []).forEach((f: any) => {
      const month = f.created_at?.substring(0, 7);
      if (!month) return;
      if (!grouped[month]) grouped[month] = { collected: 0, pending: 0 };
      if (f.status === 'paid') grouped[month].collected += Number(f.amount);
      else grouped[month].pending += Number(f.amount);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([month, amounts]) => ({ month, ...amounts }));
  }

  private async getAvailabilityAnalysis(orgId: string) {
    const { data } = await supabase.from('library_books').select('copies_total, copies_available, title').eq('organisation_id', orgId);
    const books = data || [];
    const available = books.filter((b: any) => b.copies_available > 0).length;
    const outOfStock = books.filter((b: any) => b.copies_available === 0).length;
    const lowStock = books.filter((b: any) => b.copies_available > 0 && b.copies_available <= 2).length;
    return { totalBooks: books.length, available, outOfStock, lowStock, availabilityRate: books.length > 0 ? Math.round((available / books.length) * 100) : 0 };
  }

  private async getMemberActivity(orgId: string, type: string) {
    const { data: members } = await supabase.from('library_members').select('id').eq('organisation_id', orgId).eq('member_type', type);
    const memberIds = (members || []).map((m: any) => m.id);
    if (memberIds.length === 0) return [];
    const { data: issues } = await supabase.from('library_issues').select('issue_date').in('member_id', memberIds).gte('issue_date', new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]);
    const grouped: Record<string, number> = {};
    (issues || []).forEach((i: any) => {
      const week = i.issue_date?.substring(0, 7);
      if (!week) return;
      grouped[week] = (grouped[week] || 0) + 1;
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count }));
  }

  private async getInventoryGrowth(orgId: string) {
    const { data } = await supabase.from('library_books').select('created_at').eq('organisation_id', orgId).order('created_at', { ascending: true });
    const grouped: Record<string, number> = {};
    let cumulative = 0;
    (data || []).forEach((b: any) => {
      const month = b.created_at?.substring(0, 7);
      if (!month) return;
      cumulative += 1;
      grouped[month] = cumulative;
    });
    return Object.entries(grouped).map(([month, count]) => ({ month, count }));
  }

  private async getOverdueTrend(orgId: string) {
    const { data } = await supabase.from('library_issues').select('due_date, return_date, status').eq('organisation_id', orgId).in('status', ['overdue', 'returned']);
    const overdue = (data || []).filter((i: any) => i.status === 'overdue').length;
    const total = (data || []).length;
    return { overdueCount: overdue, overdueRate: total > 0 ? Math.round((overdue / total) * 100) : 0, total };
  }

  private async getReadingRecommendations(orgId: string) {
    const popular = await this.getMostBorrowedBooks(orgId, 5);
    const { data: lowStock } = await supabase.from('library_books').select('title, author, category').eq('organisation_id', orgId).eq('copies_available', 0);
    return { popular, unavailableButRequested: lowStock || [] };
  }

  private async getInventorySuggestions(orgId: string) {
    const lowStock = await this.getLowStockBooks(orgId);
    const { data } = await supabase.from('library_books').select('category, copies_available').eq('organisation_id', orgId);
    const categoryUsage: Record<string, number> = {};
    (data || []).forEach((b: any) => {
      const cat = b.category || 'Uncategorized';
      if (!categoryUsage[cat]) categoryUsage[cat] = 0;
      categoryUsage[cat] += b.copies_available || 0;
    });
    const lowCategories = Object.entries(categoryUsage).filter(([, v]) => v <= 2).map(([k]) => k);
    return { lowStockBooks: lowStock, lowCategoryInventory: lowCategories };
  }

  private async getRecentActivity(orgId: string, limit: number) {
    const { data } = await supabase.from('library_activity_log').select('*').eq('organisation_id', orgId).order('created_at', { ascending: false }).limit(limit);
    return data || [];
  }

  private async logActivity(orgId: string, action: string, entityType: string, entityId: string | null, memberId: string | null, details: any) {
    await supabase.from('library_activity_log').insert({
      organisation_id: orgId, action, entity_type: entityType, entity_id: entityId, member_id: memberId, details,
    });
  }

  private async findOrCreateMember(orgId: string, payload: any) {
    const { data: existing } = await supabase.from('library_members').select('*')
      .eq('organisation_id', orgId).eq('user_id', payload.user_id).eq('member_type', payload.member_type).maybeSingle();
    if (existing) return existing;
    const { data, error } = await supabase.from('library_members').insert({
      organisation_id: orgId, user_id: payload.user_id, member_type: payload.member_type,
      full_name: payload.full_name || `Member ${payload.user_id?.slice(0, 8)}`,
      membership_id: `LIB-${Date.now().toString(36).toUpperCase()}`,
      status: 'active', joined_date: new Date().toISOString().split('T')[0],
    }).select().single();
    if (error) throw error;
    return data;
  }

  private groupBy(arr: any[], key: string): Record<string, number> {
    return (arr || []).reduce((acc: Record<string, number>, item: any) => {
      const k = item[key] || 'Unknown';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
  }
}

export const libraryService = new LibraryService();
