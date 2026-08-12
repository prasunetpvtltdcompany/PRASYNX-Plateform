export function Spinner() {
  return (
    <div
      className="animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600 dark:border-slate-600 dark:border-t-indigo-400"
      style={{ width: 20, height: 20 }}
    />
  );
}

export function PageState({ state }: { state: { loading: boolean; error: { message: string } | null } }) {
  if (state.loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400">
        <Spinner />
      </div>
    );
  }
  if (state.error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
        {state.error.message}
      </div>
    );
  }
  return null;
}