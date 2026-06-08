import { addMonths, endOfMonth, startOfMonth } from "date-fns";
import { useEffect, useState } from "react";
import { calendarApi } from "@/api/calendar.api";
import { CalendarMonthGrid } from "@/components/leave/calendar-month-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { getErrorMessage } from "@/lib/http-error";
import type { CalendarEvent } from "@/types/domain";
import { toast } from "sonner";

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function ManagerCalendarPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await calendarApi.team({
          from: toIsoDate(startOfMonth(month)),
          to: toIsoDate(endOfMonth(month)),
        });
        setEvents(response);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load the team calendar."));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [month]);

  if (loading && events.length === 0) {
    return <PageLoader message="Loading team calendar..." />;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Team Calendar"
        description="Approved and manager-approved leave for your direct reports only."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Scheduled absences</p>
          <p className="mt-3 font-heading text-3xl font-semibold">{events.length}</p>
          <p className="mt-2 text-xs text-muted-foreground">Unique requests overlapping the selected month.</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Pending items excluded</p>
          <p className="mt-3 font-heading text-3xl font-semibold">Yes</p>
          <p className="mt-2 text-xs text-muted-foreground">This calendar intentionally excludes unapproved requests.</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Scope</p>
          <p className="mt-3 font-heading text-3xl font-semibold">Manager only</p>
          <p className="mt-2 text-xs text-muted-foreground">Visibility is restricted to your backend team scope.</p>
        </div>
      </div>

      <CalendarMonthGrid
        month={month}
        events={events}
        onPreviousMonth={() => setMonth((current) => addMonths(current, -1))}
        onNextMonth={() => setMonth((current) => addMonths(current, 1))}
      />

      {events.length > 0 ? (
        <div className="glass-card p-5">
          <h2 className="font-heading text-xl font-semibold">Upcoming leave entries</h2>
          <div className="mt-4 space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-background/60 px-4 py-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{event.employee.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.leaveType.name} · {event.startDate} to {event.endDate}
                  </p>
                </div>
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: `${event.leaveType.colorHex}12`, color: event.leaveType.colorHex }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: event.leaveType.colorHex }} />
                  {event.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No upcoming team leave"
          description="There are no approved team absences in the selected month."
        />
      )}
    </section>
  );
}
