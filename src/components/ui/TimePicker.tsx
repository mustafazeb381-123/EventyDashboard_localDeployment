"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function TimePicker({ time, setTime, label }) {
  const [open, setOpen] = React.useState(false);

  // A helper to format the time string into a displayable format
  const formattedTime = time ? format(new Date(`2000-01-01T${time}`), "h:mm a") : "Select time";

  const handleTimeChange = (e) => {
    setTime(e.target.value);
  };

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={`time-picker-${label}`} className="px-1 text-sm font-medium text-gray-700">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={`time-picker-${label}`}
            className={cn(
              "w-full justify-between font-normal",
              !time && "text-muted-foreground"
            )}
          >
            <Clock className="h-4 w-4 opacity-50 mr-2" />
            {formattedTime}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0 bg-white" align="start">
          <div className="p-4 flex flex-col gap-2">
            <Label htmlFor="time-input" className="sr-only">Time</Label>
            <Input
              type="time"
              id="time-input"
              value={time}
              onChange={handleTimeChange}
              className="w-full text-center"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}