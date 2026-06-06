import { CalendarDays } from "lucide-react";
import { useWorkingDays } from "@/hooks/use-working-days";
import type { PublicHoliday } from "@/types/domain";

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  holidays?: PublicHoliday[];
  onChange: (range: { startDate?: string; endDate?: string }) => void;
}

export function DateRangePicker({ startDate, endDate, holidays = [], onChange }: DateRangePickerProps) {
  const { workingDays, excludedDates } = useWorkingDays({ startDate, endDate, holidays });

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">Select leave range</p>
          <p className="text-sm text-muted-foreground">Weekends and public holidays are excluded from the working-day total.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium">Start date</span>
          <input
            type="date"
            value={startDate ?? ""}
            onChange={(event) => onChange({ startDate: event.target.value || undefined, endDate })}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none ring-offset-background transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">End date</span>
          <input
            type="date"
            value={endDate ?? ""}
            min={startDate}
            onChange={(event) => onChange({ startDate, endDate: event.target.value || undefined })}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none ring-offset-background transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      <div className="mt-4 rounded-2xl bg-muted/50 px-4 py-3 text-sm">
        <p className="font-medium">{workingDays} working day(s) selected</p>
        <p className="mt-1 text-muted-foreground">
          Excluded dates: {excludedDates.length > 0 ? excludedDates.join(", ") : "None"}
        </p>
      </div>
    </div>
  );
}
