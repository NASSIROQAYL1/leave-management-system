import { useMemo } from "react";
import { eachDayOfInterval, isSaturday, isSunday, parseISO } from "date-fns";
import type { PublicHoliday } from "@/types/domain";

interface WorkingDayOptions {
  startDate?: string;
  endDate?: string;
  holidays?: PublicHoliday[];
}

export function useWorkingDays({ startDate, endDate, holidays = [] }: WorkingDayOptions) {
  return useMemo(() => {
    if (!startDate || !endDate) {
      return { workingDays: 0, excludedDates: [] as string[] };
    }

    const holidaySet = new Set(holidays.map((holiday) => holiday.date));
    const interval = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
    const excludedDates: string[] = [];
    let workingDays = 0;

    for (const day of interval) {
      const isoDate = day.toISOString().slice(0, 10);
      if (isSaturday(day) || isSunday(day) || holidaySet.has(isoDate)) {
        excludedDates.push(isoDate);
        continue;
      }
      workingDays += 1;
    }

    return { workingDays, excludedDates };
  }, [endDate, holidays, startDate]);
}
