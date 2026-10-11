"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({ className, classNames, showOutsideDays = true, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={es}
      weekStartsOn={1}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: "w-fit",
        months: "relative flex flex-col gap-4",
        month: "flex w-full flex-col gap-4",
        nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between",
        button_previous: cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-8 p-0 aria-disabled:opacity-30"),
        button_next: cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-8 p-0 aria-disabled:opacity-30"),
        month_caption: "flex h-8 w-full items-center justify-center px-8",
        caption_label: "text-sm font-medium capitalize",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground w-10 text-[0.75rem] font-normal capitalize select-none",
        week: "mt-1.5 flex w-full",
        day: "relative size-10 p-0 text-center text-sm select-none",
        day_button: cn(
          "size-10 rounded-md font-normal transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "disabled:pointer-events-none",
        ),
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:font-semibold [&>button]:hover:bg-primary",
        today: "[&>button]:ring-1 [&>button]:ring-primary/50",
        outside: "text-muted-foreground/40",
        disabled: "text-muted-foreground/30 [&>button]:line-through",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: c, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-4", c)} {...rest} />
          ) : (
            <ChevronRight className={cn("size-4", c)} {...rest} />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
