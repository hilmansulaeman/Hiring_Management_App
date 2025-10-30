"use client";
import * as React from "react";
import { format, subYears, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DobCalendarProps {
  value?: Date | null;
  onChange?: (d: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
}

export default function DobCalendar({
  value,
  onChange,
  minDate = new Date(1900, 0, 1),
  maxDate = subYears(startOfDay(new Date()), 16),
  placeholder = "Select your date of birth",
}: DobCalendarProps) {
  const [date, setDate] = React.useState<Date | undefined>(value || undefined);

  React.useEffect(() => {
    setDate(value || undefined);
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (onChange) {
      onChange(selectedDate || null);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "h-10 px-4 py-2 rounded-lg border-2 border-neutral-40 bg-white text-sm text-neutral-90 placeholder:text-neutral-60 leading-6 w-full justify-start text-left font-normal",
            !date && "text-neutral-60"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          disabled={(date) =>
            date < minDate || date > maxDate
          }
          captionLayout="dropdown"
          classNames={{
            day_selected:
              "bg-primary text-white hover:bg-primary focus:bg-primary",
            day_today:
              "ring-1 ring-neutral-400",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
