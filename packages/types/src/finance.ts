export type StudentFeeStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'waived';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'online' | 'cheque';

export interface FeeStructureRow {
  id: string;
  organisation_id: string;
  name: string;
  class_id?: string | null;
  academic_year?: string | null;
  total_amount: number;
  status: string; // 'active' | 'archived'
  created_at?: string;
}

export interface FeeItemRow {
  id: string;
  fee_structure_id: string;
  item_name: string;
  amount: number;
}

export interface FeeStructureDTO extends FeeStructureRow {
  items: FeeItemRow[];
}

export interface FeeStructureItemInput {
  item_name: string;
  amount: number;
}

export interface StudentFeeRow {
  id: string;
  organisation_id: string;
  student_id: string;
  fee_structure_id?: string | null;
  total_amount: number;
  paid_amount: number;
  due_date?: string | null;
  status: StudentFeeStatus;
  created_at?: string;
}

export interface StudentFeeDTO extends StudentFeeRow {
  student_name?: string | null;
  structure_name?: string | null;
}

export interface FeePaymentRow {
  id: string;
  organisation_id: string;
  student_fee_id: string;
  student_id?: string | null;
  amount_paid: number;
  payment_method: PaymentMethod;
  transaction_id?: string | null;
  payment_date?: string;
  receipt_url?: string | null;
  status: PaymentStatus;
}

export interface FeePaymentDTO extends FeePaymentRow {
  student_name?: string | null;
}

export interface StudentFinanceStatementDTO {
  fees: StudentFeeDTO[];
  total_charged: number;
  total_paid: number;
  outstanding: number;
}