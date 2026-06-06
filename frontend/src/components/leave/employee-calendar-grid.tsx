import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CalendarEvent, PublicHoliday } from "@/types/domain";

interface EmployeeCalendarGridProps {
  month: Date;
  events: CalendarEvent[];
  holidays: PublicHoliday[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const statusColor: Record<CalendarEvent["status"], string> = {
  PENDING: "bg-warning/15 text-warning border-warning/25",
  APPROVED_BY_MANAGER: "bg-info/15 text-info border-info/25",
  REJECTED_BY_MANAGER: "bg-danger/15 text-danger border-danger/25",
  APPROVED: "bg-success/15 text-success border-success/25",
  REJECTED: "bg-danger/15 text-danger border-danger/25",
  CANCELLED: "bg-muted text-muted-foreground border-border",
};

export function EmployeeCalendarGrid({
  month,
  events,
  holidays,
  onPreviousMonth,
  onNextMonth,
  selectedDate,
  onSelectDate,
}: EmployeeCalendarGridProps) {
  const calendarStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between rounded-3xl border border-border bg-card px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">My leave calendar</p>
          <h2 className="mt-1 font-heading text-2xl font-semibold">{format(month, "MMMM yyyy")}</h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPreviousMonth}
            className="rounded-xl border border-border px-3 py-2 transition hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="rounded-xl border border-border px-3 py-2 transition hover:bg-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekdays.map((weekday) => (
          <div key={weekday} className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {weekday}
          </div>
        ))}

        {days.map((day) => {
          const iso = format(day, "yyyy-MM-dd");
          const dayEvents = events.filter((event) => {
            const start = parseISO(event.startDate);
            const end = parseISO(event.endDate);
            return day >= start && day <= end;
          });
          const holiday = holidays.find((item) => item.date === iso);

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(iso)}
              className={cn(
                "min-h-32 rounded-2xl border border-border bg-card p-3 text-left transition hover:border-primary/40 hover:bg-muted/20",
                !isSameMonth(day, month) && "bg-muted/20 text-muted-foreground",
                selectedDate === iso && "border-primary ring-2 ring-primary/15",
                isSameDay(day, new Date()) && "shadow-[0_0_0_1px_rgba(99,102,241,0.25)]",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{format(day, "EEE")}</span>
                <span className="font-medium">{format(day, "d")}</span>
              </div>

              <div className="mt-3 space-y-2">
                {holiday ? (
                  <div className="rounded-xl border border-info/25 bg-info/10 px-2.5 py-2 text-xs text-info">
                    <p className="font-medium">Holiday</p>
                    <p className="mt-1">{holiday.name}</p>
                  </div>
                ) : null}

                {dayEvents.slice(0, 2).map((event) => (
                  <div key={`${event.id}-${iso}`} className={cn("rounded-xl border px-2.5 py-2 text-xs", statusColor[event.status])}>
                    <p className="font-medium">{event.leaveType.name}</p>
                    <p className="mt-1">{event.status.replace(/_/g, " ")}</p>
                  </div>
                ))}

                {!holiday && dayEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No leave or holiday</p>
                ) : null}
                {dayEvents.length > 2 ? <p className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</p> : null}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
