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
        weekdays: "flex justify-center",
        weekday: "text-muted-foreground w-9 sm:w-10 text-[0.7rem] sm:text-xs font-normal capitalize select-none text-center",
        week: "mt-1 flex justify-center w-full",
        day: "relative size-9 sm:size-10 p-0 text-center text-xs sm:text-sm select-none flex items-center justify-center",
        day_button: cn(
          "size-9 sm:size-10 rounded-xl font-medium transition-all hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-95 touch-manipulation",
          "disabled:pointer-events-none",
        ),
        selected:
          "[&>button]:bg-gradient-to-b [&>button]:from-amber-300 [&>button]:to-amber-500 [&>button]:text-stone-950 [&>button]:font-bold [&>button]:shadow-[0_0_20px_rgba(250,204,21,0.4)] [&>button]:scale-105",
        today: "[&>button]:ring-1 [&>button]:ring-amber-400/60 [&>button]:text-amber-300",
        outside: "text-muted-foreground/30",
        disabled: "text-muted-foreground/25 [&>button]:line-through",
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
