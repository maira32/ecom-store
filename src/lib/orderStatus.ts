export const TERMINAL_STATUSES = ['completed', 'cancelled'];
export const REVERT_WINDOW_MS = 10 * 60 * 1000; 

export interface StatusHistoryEntry {
  from: string;
  to: string;
  reason?: string;
  changedAt: string | Date;
}

export function isTerminal(status: string): boolean {
  return TERMINAL_STATUSES.includes(status);
}


export function getRevertEligibility(
  currentStatus: string,
  statusHistory: StatusHistoryEntry[] = []
): { eligible: boolean; remainingMs: number } {
  if (!isTerminal(currentStatus)) {
    return { eligible: true, remainingMs: Infinity };
  }

  const lastEntry = [...statusHistory].reverse().find((h) => h.to === currentStatus);

  if (!lastEntry) {
    return { eligible: false, remainingMs: 0 };
  }

  const becameTerminalAt = new Date(lastEntry.changedAt).getTime();
  const elapsed = Date.now() - becameTerminalAt;
  const remainingMs = Math.max(REVERT_WINDOW_MS - elapsed, 0);

  return { eligible: remainingMs > 0, remainingMs };
}