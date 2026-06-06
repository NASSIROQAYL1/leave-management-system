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
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/cn";
import type { CalendarEvent } from "@/types/domain";

interface CalendarMonthGridProps {
  month: Date;
  events: CalendarEvent[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarMonthGrid({
  month,
  events,
  onPreviousMonth,
  onNextMonth,
}: CalendarMonthGridProps) {
  const calendarStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between rounded-3xl border border-border bg-card px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Team leave calendar</p>
          <h2 className="mt-1 font-heading text-2xl font-semibold">{format(month, "MMMM yyyy")}</h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPreviousMonth}
            className="rounded-xl border border-border px-3 py-2 text-sm font-medium transition hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="rounded-xl border border-border px-3 py-2 text-sm font-medium transition hover:bg-accent"
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
          const dayEvents = events.filter((event) => {
            const start = parseISO(event.startDate);
            const end = parseISO(event.endDate);
            return day >= start && day <= end;
          });

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-36 rounded-2xl border border-border bg-card p-3",
                isSameDay(day, new Date()) ? "border-primary/60 shadow-[0_0_0_1px_rgba(0,0,0,0.02)]" : "",
                !isSameMonth(day, month) ? "bg-muted/20 text-muted-foreground" : "",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {format(day, "EEE")}
                </span>
                <span className="font-medium">{format(day, "d")}</span>
              </div>

              <div className="mt-3 space-y-2">
                {dayEvents.length > 0 ? (
                  dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={`${event.id}-${day.toISOString()}`}
                      className="rounded-xl border border-border/70 px-2.5 py-2 text-xs"
                      style={{
                        backgroundColor: `${event.leaveType.colorHex}12`,
                        borderColor: `${event.leaveType.colorHex}45`,
                      }}
                    >
                      <p className="font-medium text-foreground">{event.employee.fullName}</p>
                      <p className="mt-1 text-muted-foreground">{event.label}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No scheduled leave</p>
                )}
                {dayEvents.length > 3 ? (
                  <p className="text-xs font-medium text-muted-foreground">+{dayEvents.length - 3} more</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="No team leave this month"
          description="There are no approved or manager-approved team absences in the selected month."
          compact
        />
      ) : (
        <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-card px-4 py-3">
          <StatusBadge status="APPROVED" />
          <StatusBadge status="APPROVED_BY_MANAGER" />
        </div>
      )}
    </section>
  );
}
