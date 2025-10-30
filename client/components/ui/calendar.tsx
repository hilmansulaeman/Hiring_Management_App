"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  DayButton,
  DayPicker,
  getDefaultClassNames,
  type DayPickerProps,
  type CaptionProps,
} from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

type ButtonVariant = React.ComponentProps<typeof Button>["variant"];

export type CalendarProps = DayPickerProps & {
  buttonVariant?: ButtonVariant;
  hideDefaultNav?: boolean;
  components?: DayPickerProps["components"] & { Caption?: React.ComponentType<CaptionProps & { month: Date }> };
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  hideDefaultNav,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  const dayPickerProps: DayPickerProps = {
    className: cn(
      "bg-background group/calendar [--cell-size:--spacing(8)]",
      "[[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
      String.raw`rtl:**:[.rdp-button_next>svg]:rotate-180`,
      String.raw`rtl:**:[.rdp-button_previous>svg]:rotate-180`,
      className
    ),
    showOutsideDays,
    formatters: {
      formatMonthDropdown: (date) =>
        date.toLocaleString("default", { month: "short" }),
      ...formatters,
    },
    classNames: {
      root: cn("w-fit", defaultClassNames.root),
      months: cn("flex gap-4 flex-col md:flex-row relative", defaultClassNames.months),
      month: cn("flex flex-col w-full gap-4", defaultClassNames.month),

      /** bawaan nav – kita sembunyikan ketika pakai header kustom */
      nav: cn(
        "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
        hideDefaultNav && "hidden",
        defaultClassNames.nav
      ),
      button_previous: cn(
        buttonVariants({ variant: buttonVariant }),
        "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
        defaultClassNames.button_previous
      ),
      button_next: cn(
        buttonVariants({ variant: buttonVariant }),
        "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
        defaultClassNames.button_next
      ),

      month_caption: cn(
        "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
        defaultClassNames.month_caption
      ),
      dropdowns: cn(
        "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
        defaultClassNames.dropdowns
      ),
      dropdown_root: cn(
        "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
        defaultClassNames.dropdown_root
      ),
      dropdown: cn("absolute bg-popover inset-0 opacity-0", defaultClassNames.dropdown),
      caption_label: cn(
        "select-none font-medium",
        captionLayout === "label"
          ? "text-sm"
          : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
        defaultClassNames.caption_label
      ),

      table: "w-full border-collapse",
      weekdays: cn("grid grid-cols-7 px-4", defaultClassNames.weekdays),
      weekday: cn(
        "text-muted-foreground rounded-md font-semibold text-[13px] select-none text-center",
        defaultClassNames.weekday
      ),
      week: cn("grid grid-cols-7 px-4 mt-1", defaultClassNames.week),

      week_number_header: cn("select-none w-(--cell-size)", defaultClassNames.week_number_header),
      week_number: cn("text-[0.8rem] select-none text-muted-foreground", defaultClassNames.week_number),

      day: cn(
        "relative p-0 text-center group/day aspect-square",
        defaultClassNames.day
      ),
      range_start: cn("rounded-l-md bg-accent", defaultClassNames.range_start),
      range_middle: cn("rounded-none bg-accent", defaultClassNames.range_middle),
      range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
      today: cn("ring-1 ring-neutral-400 rounded-md", defaultClassNames.today),
      outside: cn("text-neutral-400 aria-selected:text-neutral-400", defaultClassNames.outside),
      disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
      hidden: cn("invisible", defaultClassNames.hidden),

      ...classNames,
    },
    components: {
      Root: ({ className, rootRef, ...props }) => (
        <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
      ),
      Chevron: ({ className, orientation, ...props }) => {
        if (orientation === "left") return <ChevronLeftIcon className={cn("size-4", className)} {...props} />;
        if (orientation === "right") return <ChevronRightIcon className={cn("size-4", className)} {...props} />;
        return <ChevronDownIcon className={cn("size-4", className)} {...props} />;
      },
      DayButton: CalendarDayButton,
      ...components,
    },
    ...props,
  };

  // If a custom Caption component is provided, do not pass captionLayout to DayPicker
  // Use type assertion to bypass TypeScript error with CustomComponents type
  if ((components as any)?.Caption) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { captionLayout: _, ...restProps } = dayPickerProps;
    return <DayPicker {...restProps} />;
  }

  return <DayPicker {...dayPickerProps} captionLayout={captionLayout} />;
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
      }
      className={cn(
        // gaya pemilihan sesuai mockup (rounded, fill gelap)
        "h-10 w-10 rounded-md text-sm leading-10 " +
          "data-[selected-single=true]:bg-neutral-900 data-[selected-single=true]:text-white " +
          "hover:bg-neutral-200/50 focus:bg-neutral-200/60 focus:outline-none",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
