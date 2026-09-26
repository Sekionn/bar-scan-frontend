export function StatusMessage({ type, children }: { type: 'error' | 'success' | 'info'; children: string }) {
  return <p className={`status-message ${type}`}>{children}</p>;
}
