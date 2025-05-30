"use client"

interface OpeningHoursProps {
  hours?: Array<{
    open: Array<{
      is_overnight: boolean
      start: string
      end: string
      day: number
    }>
    hours_type: string
    is_open_now?: boolean
  }>
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const formatTime = (time: string) => {
  const hour = parseInt(time.substring(0, 2))
  const minute = time.substring(2, 4)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minute} ${ampm}`
}

export const OpeningHours = ({ hours }: OpeningHoursProps) => {
  if (!hours || !hours[0]) {
    return null
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-primary mb-3">Hours</h3>
      <div className="space-y-1">
        {hours[0].open.map((dayHours, index) => (
          <div
            key={index}
            className="flex justify-between items-center text-sm"
          >
            <span className="font-medium text-primary/80">
              {DAYS[dayHours.day]}
            </span>
            <span className="text-primary/70">
              {formatTime(dayHours.start)} - {formatTime(dayHours.end)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
