-- Adds payment/transaction detail columns to public.invoices
-- so transactions (cash, bank transfer, online) are stored in the same table.
-- Idempotent: safe to run multiple times.

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS transaction_ref TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS transaction_type TEXT;

COMMENT ON COLUMN public.invoices.payment_method IS 'How the payment was made: cash, bank_transfer or online';
COMMENT ON COLUMN public.invoices.transaction_ref IS 'Bank/UPTR/receipt reference for the payment';
COMMENT ON COLUMN public.invoices.bank_name IS 'Bank used for the transfer';
COMMENT ON COLUMN public.invoices.notes IS 'Free-form notes about the transaction';
COMMENT ON COLUMN public.invoices.transaction_type IS 'Purpose of the transaction: subscription, other, etc.';
