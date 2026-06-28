let pendingOverrideDayId: string | null = null;

export function setPendingDayOverride(dayId: string) {
  pendingOverrideDayId = dayId;
}

export function consumePendingDayOverride(): string | null {
  const val = pendingOverrideDayId;
  pendingOverrideDayId = null;
  return val;
}
