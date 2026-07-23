import { supabase } from '../config/database';

type CredentialRecord = {
  id: string;
  organisation_id: string;
  organisation_name: string;
  full_name: string;
  email: string;
  role: string;
  created_by: string;
  created_at: string;
};

export async function logCredential(
  orgId: string, orgName: string, fullName: string, email: string,
  role: string, createdBy: string
) {
  try {
    await supabase.from('credential_history').insert({
      organisation_id: orgId, organisation_name: orgName,
      full_name: fullName, email, role, created_by: createdBy
    });
  } catch (err) {
    console.error('Failed to log credential to database:', err);
  }
}

export async function getCredentialHistory(): Promise<CredentialRecord[]> {
  try {
    const { data } = await supabase
      .from('credential_history')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) return data;
  } catch (err) {
    console.error('Failed to fetch credential history from database:', err);
  }
  return [];
}
