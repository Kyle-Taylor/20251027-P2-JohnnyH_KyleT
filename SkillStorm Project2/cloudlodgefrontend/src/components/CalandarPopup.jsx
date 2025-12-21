import { Box, Typography } from "@mui/material";
import dayjs from "dayjs";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function getMonthDays(year, month) {
  const start = dayjs().year(year).month(month).startOf("month");
  const daysInMonth = start.daysInMonth();
  const offset = start.day();

  const days = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return days;
}

function Month({ year, month, range, onSelect }) {
  const days = getMonthDays(year, month);
  const { start, end } = range;

  return (
    <Box sx={{ width: 280 }}>
      <Typography sx={{ mb: 2, fontWeight: 600 }}>
        {dayjs().year(year).month(month).format("MMMM YYYY")}
      </Typography>

      {/* Weekdays */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 1 }}>
        {WEEKDAYS.map((d, i) => (
          <Typography
            key={i}
            sx={{ fontSize: 12, textAlign: "center", color: "text.secondary" }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* Days */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {days.map((day, i) => {
          if (!day) return <Box key={i} />;

          const date = dayjs().year(year).month(month).date(day);
          const isStart = start && date.isSame(start, "day");
          const isEnd = end && date.isSame(end, "day");
          const inRange =
            start && end && date.isAfter(start, "day") && date.isBefore(end, "day");

          return (
            <Box
                key={i}
                onClick={() => onSelect(date)}
                sx={{
                    position: "relative",
                    height: 36,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: isStart || isEnd ? "#fff" : "text.primary",

                    /* range bar */
                    "&::before": inRange || isStart || isEnd
                    ? {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: isStart ? "50%" : 0,
                        right: isEnd ? "50%" : 0,
                        backgroundColor: "rgba(63,109,246,0.25)",
                        }
                    : {},

                    /* hover */
                    "&:hover::before": !isStart && !isEnd
                    ? {
                        content: '""',
                        position: "absolute",
                        width: 36,
                        height: 36,
                        backgroundColor: "rgba(63,109,246,0.35)",
                        borderRadius: "45%",
                        }
                    : {},
                }}
                >
                {/* start / end circle */}
                {(isStart || isEnd) && (
                    <Box
                    sx={{
                        position: "absolute",
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        backgroundColor: "#3f6df6",
                    }}
                    />
                )}

                {/* day number */}
                <Box sx={{ position: "relative", zIndex: 1 }}>
                    {day}
                </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default function CalendarPopup({ range, onSelect }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 4,
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        p: 3,
      }}
      onClick={e => e.stopPropagation()}
    >
      <Box sx={{ display: "flex", gap: 4 }}>
        <Month year={2025} month={11} range={range} onSelect={onSelect} />
        <Month year={2026} month={0} range={range} onSelect={onSelect} />
      </Box>
    </Box>
  );
}