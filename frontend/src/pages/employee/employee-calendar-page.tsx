import { addMonths, format, startOfMonth } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { calendarApi } from "@/api/calendar.api";
import { publicHolidaysApi } from "@/api/public-holidays.api";
import { EmployeeCalendarGrid } from "@/components/leave/employee-calendar-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { StatusBadge } from "@/components/ui/status-badge";
import { getErrorMessage } from "@/lib/http-error";
import type { CalendarEvent, PublicHoliday } from "@/types/domain";
import { toast } from "sonner";

export function EmployeeCalendarPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const year = month.getFullYear();

    const load = async () => {
      try {
        setLoading(true);
        const [calendarData, holidayData] = await Promise.all([
          calendarApi.my(year),
          publicHolidaysApi.list(year),
        ]);
        setEvents(calendarData);
        setHolidays(holidayData);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load your calendar."));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [month]);

  const selectedEvents = useMemo(
    () =>
      selectedDate
        ? events.filter((event) => {
            return selectedDate >= event.startDate && selectedDate <= event.endDate;
          })
        : [],
    [events, selectedDate],
  );

  const selectedHoliday = useMemo(
    () => holidays.find((holiday) => holiday.date === selectedDate),
    [holidays, selectedDate],
  );

  if (loading && events.length === 0 && holidays.length === 0) {
    return <PageLoader message="Loading your calendar..." />;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="My Calendar"
        description="View your personal leave history and public holidays together in a single monthly calendar."
      />

      <EmployeeCalendarGrid
        month={month}
        events={events}
        holidays={holidays}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onPreviousMonth={() => setMonth((current) => addMonths(current, -1))}
        onNextMonth={() => setMonth((current) => addMonths(current, 1))}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="glass-card p-5">
          <h2 className="font-heading text-xl font-semibold">Selected day details</h2>
          <p className="mt-1 text-sm text-muted-foreground">{selectedDate ?? "Choose a day from the calendar."}</p>

          {selectedHoliday || selectedEvents.length > 0 ? (
            <div className="mt-5 space-y-4">
              {selectedHoliday ? (
                <div className="rounded-2xl border border-info/20 bg-info/10 px-4 py-3">
                  <p className="font-medium text-info">{selectedHoliday.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Public holiday</p>
                </div>
              ) : null}

              {selectedEvents.map((event) => (
                <div key={event.id} className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{event.leaveType.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.startDate} to {event.endDate}
                      </p>
                    </div>
                    <StatusBadge status={event.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No leave on this day"
              description="Select another date to inspect a leave entry or holiday."
              compact
            />
          )}
        </div>

        <div className="glass-card p-5">
          <h2 className="font-heading text-xl font-semibold">Holiday list</h2>
          <p className="mt-1 text-sm text-muted-foreground">Public holidays for {month.getFullYear()} used by working-day calculations.</p>
          <div className="mt-5 space-y-3">
            {holidays.length > 0 ? (
              holidays.map((holiday) => (
                <div key={holiday.id} className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                  <p className="font-medium">{holiday.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{holiday.date}</p>
                </div>
              ))
            ) : (
              <EmptyState
                title="No public holidays"
                description="No holidays are configured for this year yet."
                compact
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
