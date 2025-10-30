"use client";

import * as React from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfDay,
  subYears,
  isBefore,
  isAfter,
} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigation, type CaptionProps, type CustomComponents } from "react-day-picker";

/** Context untuk batas min/max tanggal */
interface DateRangeContextType { minDate: Date; maxDate: Date; }
const DateRangeContext = React.createContext<DateRangeContextType | undefined>(undefined);
function useDateRange() {
  const ctx = React.useContext(DateRangeContext);
  if (!ctx) throw new Error("useDateRange must be used within a DateRangeProvider");
  return ctx;
}

export interface DateOfBirthPickerProps {
  label?: string;
  required?: boolean;
  value?: Date | null;
  onChange?: (value: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  inputClassName?: string;
  disabled?: boolean;
  id?: string;
  hasError?: boolean; // Add hasError prop
}

/** Header kustom: « ‹   Jan   2001   › » */
function CustomCaption({ month: m }: CaptionProps & { month: Date }) {
  const { goToMonth } = useNavigation();
  const { minDate, maxDate } = useDateRange();

  const prevMonth = subMonths(m, 1);
  const nextMonth = addMonths(m, 1);
  const prevYear  = subMonths(m, 12);
  const nextYear  = addMonths(m, 12);

  const isBeforeMin = (d: Date) =>
    !!minDate && isBefore(d, new Date(minDate.getFullYear(), minDate.getMonth(), 1));
  const isAfterMax = (d: Date) =>
    !!maxDate && isAfter(d, new Date(maxDate.getFullYear(), maxDate.getMonth(), 1));

  const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, children, ...p }) => (
    <button
      {...p}
      className={cn(
        "h-8 w-8 rounded-md grid place-items-center text-[15px] font-semibold",
        "hover:bg-neutral-200/50 focus:outline-none focus:ring-2 focus:ring-ring",
        "disabled:opacity-40 disabled:pointer-events-none",
        className
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
      {/* kiri: « ‹ */}
      <div className="flex items-center gap-1 text-neutral-900"> {/* Changed to text-neutral-900 */}
        <Btn aria-label="Previous year"  onClick={() => goToMonth(prevYear)}  disabled={isBeforeMin(prevYear)}>&laquo;</Btn>
        <Btn aria-label="Previous month" onClick={() => goToMonth(prevMonth)} disabled={isBeforeMin(prevMonth)}>&lsaquo;</Btn>
      </div>

      {/* tengah: Jan   2001 */}
      <div className="select-none flex items-baseline gap-6 text-neutral-900"> {/* Changed to text-neutral-900 */}
        <span className="text-base font-semibold tracking-wide">{format(m, "MMM")}</span>
        <span className="text-base font-bold">{format(m, "yyyy")}</span>
      </div>

      {/* kanan: › » */}
      <div className="flex items-center gap-1 text-neutral-900"> {/* Changed to text-neutral-900 */}
        <Btn aria-label="Next month" onClick={() => goToMonth(nextMonth)} disabled={isAfterMax(nextMonth)}>&rsaquo;</Btn>
        <Btn aria-label="Next year"  onClick={() => goToMonth(nextYear)}  disabled={isAfterMax(nextYear)}>&raquo;</Btn>
      </div>
    </div>
  );
}

export function DateOfBirthPicker({
  label = "Date of birth",
  required = false,
  value,
  onChange,
  placeholder = "Select your date of birth",
  minDate = new Date(1900, 0, 1),
  maxDate = subYears(startOfDay(new Date()), 16),
  inputClassName,
  disabled = false,
  id,
  hasError = false, // Default to false
}: DateOfBirthPickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value || undefined);

  React.useEffect(() => { setDate(value || undefined); }, [value]);

  const handleSelect = (d: Date | undefined) => {
    setDate(d);
    onChange?.(d ?? null);
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs text-neutral-90 leading-5">
        {label} {required && <span className="text-destructive">*</span>}
      </label>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              "h-10 px-4 py-2 rounded-lg border-2",
              hasError ? "border-destructive" : "border-neutral-40", // Apply destructive border if hasError is true
              "bg-white text-sm text-neutral-90 placeholder:text-neutral-60 leading-6 w-full justify-start text-left font-normal",
              !date && "text-neutral-60",
              inputClassName,
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-auto p-1.5 rounded-3xl shadow-lg border bg-white"
        >
          <div className="rounded-3xl bg-neutral-100/60">
            <DateRangeContext.Provider value={{ minDate, maxDate }}>
              <Calendar
                hideDefaultNav                 // sembunyikan nav bawaan
                mode="single"
                selected={date}
                onSelect={handleSelect}
                initialFocus
                showOutsideDays
                weekStartsOn={0}
                fromDate={minDate}
                toDate={maxDate}
                defaultMonth={value ?? new Date(2001, 0, 1)}
                components={{ Caption: (p) => <CustomCaption {...p} month={p.month} /> }}
                className="rounded-3xl p-1.5"
                classNames={{
                  nav: "hidden",
                  months: "p-3",
                  month: "space-y-2",
                  head_row: "grid grid-cols-7 px-4",
                  head_cell: "h-8 w-10 text-[13px] font-semibold text-neutral-600 text-center",
                  row: "grid grid-cols-7 px-4",
                  cell: "relative p-0 text-center",
                  day: "h-10 w-10 rounded-md text-sm leading-10 hover:bg-neutral-200/50 focus:bg-neutral-200/60 focus:outline-none",
                  day_selected: "bg-neutral-900 text-white",
                  caption: "pb-1",
                }}
              />
            </DateRangeContext.Provider>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
