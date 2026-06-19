import { Label } from "@radix-ui/react-dropdown-menu"
import { useState } from "react"
import { Input } from "../ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "../ui/calendar"
import { Field, FieldLabel } from "../ui/field"

function formatDate(date) {
    if (!date) return ""

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    }).format(date)
}

function getISTDate() {
    return new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    )
}

export function CalenderCustom({textLabel}) {
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState(getISTDate())
    const [month, setMonth] = useState(date)
    const [value, setValue] = useState(formatDate(date))

    return (
        <div className="flex flex-col gap-3">
            <Field>
                <FieldLabel htmlFor="date" className="px-1">
                    {textLabel || "Date"}
                </FieldLabel>

                <div className="relative flex gap-2">
                    <Input
                        id="date"
                        value={value}
                        placeholder="01 June 2025"
                        className="bg-background pr-10"
                        onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                                e.preventDefault()
                                setOpen(true)
                            }
                        }}
                        readOnly
                    />

                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                            >
                                <CalendarIcon className="size-3.5" />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto overflow-hidden p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                month={month}
                                captionLayout="dropdown"
                                onMonthChange={setMonth}
                                onSelect={(d) => {
                                    if (!d) return
                                    setDate(d)
                                    setValue(formatDate(d))
                                    setOpen(false)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </Field>
        </div>
    )
}
