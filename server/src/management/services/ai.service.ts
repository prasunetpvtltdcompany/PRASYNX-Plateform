import { supabase } from '../config/database';

export class AIService {
  // ========== ATTENDANCE AI ==========

  async analyzeAttendance(orgId: string, studentId?: string) {
    let query = supabase.from('attendance').select('*, student:students(full_name, class_id, classes:classes!students_class_id_fkey(name))');
    if (studentId) {
      query = query.eq('student_id', studentId);
    } else {
      const { data: students } = await supabase.from('students').select('id').eq('organisation_id', orgId);
      if (students) query = query.in('student_id', students.map(s => s.id));
    }

    const { data: records } = await query;
    if (!records || records.length === 0) return [];

    const grouped: Record<string, any> = {};
    for (const r of records) {
      const sid = r.student_id;
      if (!grouped[sid]) grouped[sid] = { studentId: sid, studentName: r.student?.full_name || 'Unknown', total: 0, present: 0, absent: 0, late: 0, records: [] };
      grouped[sid].total++;
      if (r.status === 'present') grouped[sid].present++;
      else if (r.status === 'absent') grouped[sid].absent++;
      else if (r.status === 'late') grouped[sid].late++;
      grouped[sid].records.push(r);
    }

    return Object.values(grouped).map((g: any) => ({
      ...g,
      percentage: g.total > 0 ? Math.round((g.present / g.total) * 100) : 0,
      riskLevel: g.total > 0 && (g.present / g.total) < 0.75 ? 'high' : (g.present / g.total) < 0.85 ? 'medium' : 'low',
    }));
  }

  async detectLowAttendance(orgId: string, threshold = 75) {
    const analysis = await this.analyzeAttendance(orgId);
    return analysis.filter((a: any) => a.percentage < threshold).map((a: any) => ({
      studentId: a.studentId,
      studentName: a.studentName,
      attendancePercentage: a.percentage,
      alert: `Attendance below ${threshold}% threshold`,
    }));
  }

  async predictAbsenteeism(orgId: string) {
    const analysis = await this.analyzeAttendance(orgId);
    const predictions: any[] = [];

    for (const a of analysis as any[]) {
      const recentRecords = (a.records || []).slice(-10);
      const recentAbsent = recentRecords.filter((r: any) => r.status === 'absent').length;
      const streak = this.longestStreak(recentRecords, 'absent');

      if (recentAbsent >= 4 || streak >= 3) {
        predictions.push({
          studentId: a.studentId,
          studentName: a.studentName,
          currentPercentage: a.percentage,
          riskFactor: 'high',
          reason: streak >= 3 ? `Absent ${streak} consecutive days` : `${recentAbsent} absences in last 10 days`,
          suggestedAction: 'Schedule parent-teacher meeting and investigate root cause',
        });
      } else if (recentAbsent >= 2) {
        predictions.push({
          studentId: a.studentId,
          studentName: a.studentName,
          currentPercentage: a.percentage,
          riskFactor: 'medium',
          reason: `${recentAbsent} absences in last 10 days`,
          suggestedAction: 'Send attendance alert to parents',
        });
      }
    }

    return predictions;
  }

  async generateAttendanceAlerts(orgId: string): Promise<any[]> {
    const lowAttendance = await this.detectLowAttendance(orgId, 75);
    const alerts: any[] = [];

    for (const student of lowAttendance) {
      const existing = await supabase
        .from('notifications')
        .select('id')
        .eq('reference_type', 'attendance_alert')
        .eq('reference_id', student.studentId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (!existing.data || existing.data.length === 0) {
        alerts.push(student);
      }
    }

    return alerts;
  }

  // ========== LIBRARY AI ==========

  async getBookRecommendations(studentId: string, limit = 5) {
    const { data: borrows } = await supabase
      .from('library_issues')
      .select('*, book:library_books(*)')
      .eq('student_id', studentId)
      .order('issue_date', { ascending: false });

    if (!borrows || borrows.length === 0) {
      const { data: popular } = await supabase
        .from('library_books')
        .select('*')
        .order('copies_total', { ascending: false })
        .limit(limit);
      return { recommendations: popular || [], basedOn: 'popular' };
    }

    const borrowedCategories = borrows
      .filter((b: any) => b.book?.category)
      .map((b: any) => b.book.category);
    const topCategory = this.mostFrequent(borrowedCategories);

    const { data: recommendations } = await supabase
      .from('library_books')
      .select('*')
      .eq('category', topCategory)
      .not('id', 'in', `(${borrows.filter(b => b.book).map((b: any) => `"${b.book_id}"`).join(',')})`)
      .limit(limit);

    return { recommendations: recommendations || [], basedOn: `category: ${topCategory}` };
  }

  async getReadingAnalytics(studentId: string) {
    const { data: borrows } = await supabase
      .from('library_issues')
      .select('*, book:library_books(*)')
      .eq('student_id', studentId)
      .order('issue_date', { ascending: false });

    if (!borrows || borrows.length === 0) {
      return { totalBooksBorrowed: 0, currentBorrowed: 0, overdue: 0, categories: [], readingStreak: 0 };
    }

    const currentBorrowed = borrows.filter((b: any) => b.status === 'issued').length;
    const overdue = borrows.filter((b: any) => b.status === 'issued' && new Date(b.due_date) < new Date()).length;
    const categories = borrows.filter((b: any) => b.book?.category).reduce((acc: any, b: any) => {
      const cat = b.book.category;
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return {
      totalBooksBorrowed: borrows.length,
      currentBorrowed,
      overdue,
      categories: Object.entries(categories).map(([name, count]) => ({ name, count })),
      readingStreak: this.calculateStreak(borrows),
    };
  }

  // ========== ASSIGNMENT AI ==========

  async autoGrade(submissionText: string, answerKey: string): Promise<{ grade: number; feedback: string }> {
    const studentWords = submissionText.toLowerCase().split(/\s+/).filter(Boolean);
    const keyWords = answerKey.toLowerCase().split(/\s+/).filter(Boolean);

    const keySet = new Set(keyWords);
    const matched = studentWords.filter(w => keySet.has(w));
    const uniqueMatched = new Set(matched).size;
    const score = keySet.size > 0 ? Math.round((uniqueMatched / keySet.size) * 100) : 0;

    let feedback: string;
    if (score >= 80) feedback = 'Excellent! Your answer covers the key concepts thoroughly.';
    else if (score >= 60) feedback = 'Good job! Most key points are covered. Review the suggested answer for areas to improve.';
    else if (score >= 40) feedback = 'Fair attempt. Please review the key concepts and try again.';
    else feedback = 'Needs improvement. Please study the topic and resubmit.';

    return { grade: Math.min(score, 100), feedback };
  }

  async generateFeedback(submissionId: string): Promise<string> {
    const { data: submission } = await supabase
      .from('assignment_submissions')
      .select('*, assignment:assignments(*)')
      .eq('id', submissionId)
      .single();

    if (!submission) return 'Submission not found.';

    const text = submission.content || submission.file_url || '';
    const desc = (submission.assignment as any)?.description || '';

    if (!text) return 'No content to analyze.';

    const wordCount = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    const avgWordsPerSentence = sentences > 0 ? Math.round(wordCount / sentences) : 0;

    let feedback = `Submission analysis: ${wordCount} words, ${sentences} sentences. `;
    if (avgWordsPerSentence > 30) feedback += 'Sentences are quite long; consider breaking them up for clarity. ';
    else if (avgWordsPerSentence < 8) feedback += 'Consider elaborating more on each point. ';
    else feedback += 'Good sentence structure. ';

    if (desc && text.toLowerCase().includes(desc.toLowerCase().slice(0, 20))) {
      feedback += 'Key topics from the assignment description are addressed. ';
    } else if (desc) {
      feedback += 'Review the assignment description to ensure all requirements are met. ';
    }

    return feedback;
  }

  async getPerformanceInsights(studentId: string) {
    const { data: grades } = await supabase
      .from('grades')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: true });

    const { data: submissions } = await supabase
      .from('assignment_submissions')
      .select('*, assignment:assignments(*)')
      .eq('student_id', studentId);

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (grades && grades.length > 0) {
      const bySubject: Record<string, number[]> = {};
      for (const g of grades) {
        if (!bySubject[g.subject]) bySubject[g.subject] = [];
        const gradeVal = parseInt(g.grade) || (g.grade === 'A' ? 90 : g.grade === 'B' ? 75 : g.grade === 'C' ? 60 : g.grade === 'D' ? 45 : g.grade === 'F' ? 30 : 50);
        bySubject[g.subject].push(gradeVal);
      }

      for (const [subject, scores] of Object.entries(bySubject)) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg >= 70) strengths.push(subject);
        else if (avg < 50) weaknesses.push(subject);
      }
    }

    return {
      strengths,
      weaknesses,
      totalAssignments: submissions?.length || 0,
      gradedAssignments: submissions?.filter(s => s.grade).length || 0,
      averageGrade: submissions?.filter(s => s.grade).reduce((acc, s) => acc + (parseInt(s.grade) || 0), 0) / (submissions?.filter(s => s.grade).length || 1),
    };
  }

  // ========== PREDICTIVE AI ==========

  async predictAtRiskStudents(orgId: string) {
    const attendanceAnalysis = await this.analyzeAttendance(orgId);
    const atRisk: any[] = [];

    for (const student of attendanceAnalysis as any[]) {
      let riskScore = 0;
      const reasons: string[] = [];

      if (student.percentage < 75) { riskScore += 30; reasons.push('Low attendance'); }
      else if (student.percentage < 85) { riskScore += 15; reasons.push('Declining attendance'); }

      const { data: grades } = await supabase
        .from('grades')
        .select('grade')
        .eq('student_id', student.studentId);

      if (grades && grades.length > 0) {
        const numericGrades = grades.map(g => parseInt(g.grade) || (g.grade === 'A' ? 90 : g.grade === 'B' ? 75 : g.grade === 'C' ? 60 : g.grade === 'D' ? 45 : g.grade === 'F' ? 30 : 50));
        const avg = numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length;
        if (avg < 40) { riskScore += 40; reasons.push('Critically low grades'); }
        else if (avg < 60) { riskScore += 25; reasons.push('Below average grades'); }
      }

      if (riskScore >= 30) {
        atRisk.push({
          studentId: student.studentId,
          studentName: student.studentName,
          riskScore,
          riskLevel: riskScore >= 50 ? 'high' : 'medium',
          reasons,
          attendancePercentage: student.percentage,
          suggestedIntervention: riskScore >= 50
            ? 'Immediate counseling and parent meeting required'
            : 'Monitor closely and provide additional support',
        });
      }
    }

    return atRisk;
  }

  async predictPerformanceDecline(orgId: string) {
    const { data: allGrades } = await supabase
      .from('grades')
      .select('*, student:students(full_name)')
      .order('created_at', { ascending: true });

    if (!allGrades) return [];

    const byStudent: Record<string, any> = {};
    for (const g of allGrades) {
      if (!byStudent[g.student_id]) byStudent[g.student_id] = { studentId: g.student_id, studentName: g.student?.full_name || 'Unknown', grades: [] };
      byStudent[g.student_id].grades.push(g);
    }

    const declining: any[] = [];
    for (const [_, s] of Object.entries(byStudent)) {
      const student = s as any;
      if (student.grades.length >= 3) {
        const bySubject: Record<string, number[]> = {};
        for (const g of student.grades) {
          if (!bySubject[g.subject]) bySubject[g.subject] = [];
          bySubject[g.subject].push(parseInt(g.grade) || 50);
        }

        for (const [subject, scores] of Object.entries(bySubject)) {
          const nums = scores as number[];
          const firstHalf = nums.slice(0, Math.ceil(nums.length / 2));
          const secondHalf = nums.slice(Math.ceil(nums.length / 2));
          const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

          if (firstAvg - secondAvg > 15) {
            declining.push({
              studentId: student.studentId,
              studentName: student.studentName,
              subject,
              previousAverage: Math.round(firstAvg),
              currentAverage: Math.round(secondAvg),
              decline: Math.round(firstAvg - secondAvg),
              alert: `Performance declining in ${subject}`,
            });
          }
        }
      }
    }

    return declining;
  }

  async predictDropoutRisk(orgId: string) {
    const atRisk = await this.predictAtRiskStudents(orgId);
    return atRisk.filter(s => s.riskScore >= 60).map(s => ({
      ...s,
      dropoutRisk: 'high',
      warning: `Student ${s.studentName} shows significant risk factors for dropout. Immediate intervention required.`,
    }));
  }

  async generateStudyPlan(studentId: string, weakSubjects: string[]) {
    const plan = weakSubjects.map((subject, i) => ({
      week: i + 1,
      subject,
      focus: `Review core ${subject} concepts`,
      activities: [
        `Practice ${subject} problems for 30 mins daily`,
        `Review class notes for ${subject}`,
        `Complete ${subject} assignments before deadline`,
      ],
      resources: [`${subject} textbook chapters`, `Online ${subject} tutorials`, 'Practice worksheets'],
    }));

    return {
      studentId,
      durationWeeks: weakSubjects.length,
      dailyStudyHours: 2,
      plan,
      tips: [
        'Create a quiet study environment',
        'Take breaks every 25 minutes',
        'Review material before sleeping',
        'Practice active recall techniques',
      ],
    };
  }

  async generateQuiz(subject: string, topic: string, difficulty: 'easy' | 'medium' | 'hard', count = 5) {
    const templates: Record<string, any[]> = {
      mathematics: [
        { question: 'What is the value of π (pi) to 2 decimal places?', options: ['3.14', '3.16', '3.12', '3.18'], answer: '3.14' },
        { question: 'What is the square root of 144?', options: ['10', '11', '12', '13'], answer: '12' },
        { question: 'If 3x + 7 = 22, what is x?', options: ['3', '5', '7', '9'], answer: '5' },
        { question: 'What is the area of a circle with radius 5cm?', options: ['25π cm²', '10π cm²', '5π cm²', '15π cm²'], answer: '25π cm²' },
        { question: 'What is 15% of 200?', options: ['20', '25', '30', '35'], answer: '30' },
      ],
      science: [
        { question: 'What is the chemical symbol for water?', options: ['H2O', 'CO2', 'NaCl', 'O2'], answer: 'H2O' },
        { question: 'What planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 'Mars' },
        { question: 'What is the speed of light approximately?', options: ['3×10⁸ m/s', '3×10⁶ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'], answer: '3×10⁸ m/s' },
        { question: 'What gas do plants absorb from the atmosphere?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], answer: 'Carbon dioxide' },
        { question: 'What is the smallest unit of matter?', options: ['Atom', 'Molecule', 'Cell', 'Electron'], answer: 'Atom' },
      ],
      english: [
        { question: 'Which word is a synonym for "happy"?', options: ['Sad', 'Joyful', 'Angry', 'Tired'], answer: 'Joyful' },
        { question: 'What is the past tense of "run"?', options: ['Runed', 'Ran', 'Running', 'Runs'], answer: 'Ran' },
        { question: 'Identify the noun in: "The beautiful butterfly flew away."', options: ['Beautiful', 'Butterfly', 'Flew', 'Away'], answer: 'Butterfly' },
        { question: 'What is a metaphor?', options: ['A comparison using like/as', 'A direct comparison', 'An exaggeration', 'A sound word'], answer: 'A direct comparison' },
        { question: 'Which sentence is correct?', options: ['He go to school', 'He goes to school', 'He going to school', 'He gone to school'], answer: 'He goes to school' },
      ],
    };

    const subjectKey = subject.toLowerCase();
    const questionPool = templates[subjectKey] || Object.values(templates)[0];
    const selected = questionPool.slice(0, Math.min(count, questionPool.length));

    return {
      subject,
      topic,
      difficulty,
      totalQuestions: selected.length,
      timeLimit: difficulty === 'easy' ? selected.length * 2 : difficulty === 'medium' ? selected.length * 1.5 : selected.length,
      questions: selected.map((q, i) => ({ id: i + 1, ...q })),
    };
  }

  // ========== HELPERS ==========

  private longestStreak(records: any[], status: string): number {
    let maxStreak = 0;
    let current = 0;
    for (const r of records) {
      if (r.status === status) { current++; maxStreak = Math.max(maxStreak, current); }
      else current = 0;
    }
    return maxStreak;
  }

  private mostFrequent(arr: string[]): string {
    const freq: Record<string, number> = {};
    let maxFreq = 0;
    let mostFreq = '';
    for (const item of arr) {
      freq[item] = (freq[item] || 0) + 1;
      if (freq[item] > maxFreq) { maxFreq = freq[item]; mostFreq = item; }
    }
    return mostFreq;
  }

  private calculateStreak(borrows: any[]): number {
    if (borrows.length === 0) return 0;
    let streak = 1;
    for (let i = 1; i < borrows.length; i++) {
      const daysDiff = (new Date(borrows[i - 1].issue_date).getTime() - new Date(borrows[i].issue_date).getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff <= 30) streak++;
      else break;
    }
    return streak;
  }
}

export const aiService = new AIService();
