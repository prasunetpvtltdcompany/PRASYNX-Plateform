import { supabase } from '../config/database';

export class CredentialsService {
  async getDashboard(orgId: string) {
    const [certsRes, credsRes, transRes, badgesRes] = await Promise.all([
      supabase.from('digital_certificates').select('id, certificate_type, status, issued_date').eq('organisation_id', orgId),
      supabase.from('verifiable_credentials').select('id, credential_type, issued_date').eq('organisation_id', orgId),
      supabase.from('academic_transcripts').select('id').eq('organisation_id', orgId),
      supabase.from('skill_badges').select('id, badge_type, issued_date').eq('organisation_id', orgId),
    ]);

    const certificates = certsRes.data || [];
    const verifiedCerts = certificates.filter((c: any) => c.status === 'verified');
    const recentIssuances = [...certificates, ...(credsRes.data || [])]
      .filter((c: any) => new Date(c.issued_date) > new Date(Date.now() - 30 * 86400000)).length;

    const badgeTypes = (badgesRes.data || []).reduce((acc: any, b: any) => {
      acc[b.badge_type] = (acc[b.badge_type] || 0) + 1;
      return acc;
    }, {});

    const credentialsByType = (credsRes.data || []).reduce((acc: any, c: any) => {
      acc[c.credential_type] = (acc[c.credential_type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalCertificates: certificates.length,
      verifiedCertificates: verifiedCerts.length,
      pendingVerification: certificates.length - verifiedCerts.length,
      totalCredentials: credsRes.data?.length || 0,
      totalTranscripts: transRes.data?.length || 0,
      totalBadges: badgesRes.data?.length || 0,
      recentIssuances,
      badgeTypes,
      credentialsByType,
      issuanceRate: certificates.length > 0 ? Math.round((recentIssuances / certificates.length) * 100) : 0,
    };
  }

  async getCertificates(orgId: string) {
    const { data, error } = await supabase
      .from('digital_certificates')
      .select('*, student:students(full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))')
      .eq('organisation_id', orgId)
      .order('issued_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createCertificate(orgId: string, body: any) {
    const { data, error } = await supabase.from('digital_certificates').insert({
      organisation_id: orgId,
      student_id: body.student_id,
      certificate_type: body.certificate_type,
      title: body.title,
      description: body.description,
      blockchain_hash: body.blockchain_hash,
      ipfs_url: body.ipfs_url,
      issued_date: body.issued_date || new Date().toISOString(),
      expiry_date: body.expiry_date,
      status: body.status || 'active',
    }).select().single();
    if (error) throw error;
    return data;
  }

  async updateCertificate(id: string, body: any) {
    const { data, error } = await supabase.from('digital_certificates').update(body).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteCertificate(id: string) {
    const { error } = await supabase.from('digital_certificates').delete().eq('id', id);
    if (error) throw error;
    return { deleted: true };
  }

  async getCredentials(orgId: string) {
    const { data, error } = await supabase
      .from('verifiable_credentials')
      .select('*, student:students(full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))')
      .eq('organisation_id', orgId)
      .order('issued_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createCredential(orgId: string, body: any) {
    const { data, error } = await supabase.from('verifiable_credentials').insert({
      organisation_id: orgId,
      student_id: body.student_id,
      credential_type: body.credential_type,
      title: body.title,
      issuer: body.issuer,
      credential_data: body.credential_data,
      blockchain_hash: body.blockchain_hash,
      issued_date: body.issued_date || new Date().toISOString(),
      expiry_date: body.expiry_date,
    }).select().single();
    if (error) throw error;
    return data;
  }

  async getTranscripts(orgId: string) {
    const { data, error } = await supabase
      .from('academic_transcripts')
      .select('*, student:students(full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))')
      .eq('organisation_id', orgId)
      .order('issued_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createTranscript(orgId: string, body: any) {
    const { data, error } = await supabase.from('academic_transcripts').insert({
      organisation_id: orgId,
      student_id: body.student_id,
      transcript_data: body.transcript_data,
      qr_code: body.qr_code,
      issued_date: body.issued_date || new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    return data;
  }

  async getBadges(orgId: string) {
    const { data, error } = await supabase
      .from('skill_badges')
      .select('*, student:students(full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))')
      .eq('organisation_id', orgId)
      .order('issued_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createBadge(orgId: string, body: any) {
    const { data, error } = await supabase.from('skill_badges').insert({
      organisation_id: orgId,
      student_id: body.student_id,
      badge_name: body.badge_name,
      badge_type: body.badge_type,
      issuer: body.issuer,
      issued_date: body.issued_date || new Date().toISOString(),
      badge_url: body.badge_url,
    }).select().single();
    if (error) throw error;
    return data;
  }

  async verifyCertificate(hash: string) {
    const { data, error } = await supabase
      .from('digital_certificates')
      .select('*, student:students(full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))')
      .eq('blockchain_hash', hash)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return { verified: false, certificate: null };
    }
    return { verified: true, certificate: data };
  }

  async getAnalytics(orgId: string) {
    const [certsRes, credsRes, badgesRes] = await Promise.all([
      supabase.from('digital_certificates').select('certificate_type, status, issued_date').eq('organisation_id', orgId),
      supabase.from('verifiable_credentials').select('credential_type, issued_date').eq('organisation_id', orgId),
      supabase.from('skill_badges').select('badge_type, issued_date').eq('organisation_id', orgId),
    ]);

    const certs = certsRes.data || [];
    const certsByType = certs.reduce((acc: any, c: any) => {
      acc[c.certificate_type] = (acc[c.certificate_type] || 0) + 1;
      return acc;
    }, {});

    const monthlyIssuance: any = {};
    [...certs, ...(credsRes.data || []), ...(badgesRes.data || [])].forEach((item: any) => {
      const month = new Date(item.issued_date).toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyIssuance[month] = (monthlyIssuance[month] || 0) + 1;
    });

    return {
      totalCertificates: certs.length,
      verifiedCount: certs.filter((c: any) => c.status === 'verified').length,
      certificatesByType: certsByType,
      monthlyIssuance,
      totalBadges: badgesRes.data?.length || 0,
      totalCredentials: credsRes.data?.length || 0,
    };
  }

  async getReports(orgId: string, type?: string) {
    const [certificates, credentials, badges, transcripts] = await Promise.all([
      this.getCertificates(orgId),
      this.getCredentials(orgId),
      this.getBadges(orgId),
      this.getTranscripts(orgId),
    ]);

    return {
      summary: {
        totalCertificates: certificates.length,
        totalCredentials: credentials.length,
        totalBadges: badges.length,
        totalTranscripts: transcripts.length,
        verifiedCertificates: certificates.filter((c: any) => c.status === 'verified').length,
      },
      certificates,
      credentials,
      badges,
      transcripts,
      generatedAt: new Date().toISOString(),
    };
  }

  async getSidebar(orgId: string) {
    const stats = await this.getDashboard(orgId);
    return {
      stats: [
        { label: 'Certificates', value: stats.totalCertificates, icon: 'Award' },
        { label: 'Credentials', value: stats.totalCredentials, icon: 'BadgeCheck' },
        { label: 'Badges', value: stats.totalBadges, icon: 'Medal' },
        { label: 'Verified', value: stats.verifiedCertificates, icon: 'ShieldCheck' },
      ],
    };
  }
}

export const credentialsService = new CredentialsService();
