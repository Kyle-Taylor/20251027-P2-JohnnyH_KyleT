import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CancelBookingButton from "./CancelBookingButton";
import { useGetDashboardQuery, useLazyGetUserQuery } from "../store/apiSlice";

export default function UpcomingReservations() {
  const [reservationMonth, setReservationMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [page, setPage] = useState(1);
  const [triggerUser] = useLazyGetUserQuery();
  const rowsPerPage = 8;

  const dashboardParams = reservationMonth
    ? {
        reservationMonth: `${reservationMonth.getFullYear()}-${String(
          reservationMonth.getMonth() + 1
        ).padStart(2, "0")}`,
      }
    : {};

  const { data, isLoading, refetch } = useGetDashboardQuery(dashboardParams);

  useEffect(() => {
    setUpcomingReservations(data?.upcomingReservations || []);
  }, [data]);

  useEffect(() => {
    let active = true;
    const fetchUsers = async () => {
      const userIds = Array.from(
        new Set(upcomingReservations.map(r => r.userId).filter(Boolean))
      );
      if (userIds.length === 0) {
        if (active) setUserMap({});
        return;
      }

      try {
        const entries = await Promise.all(
          userIds.map(async (userId) => {
            try {
              const data = await triggerUser(userId).unwrap();
              return [userId, data];
            } catch {
              return [userId, null];
            }
          })
        );
        if (active) setUserMap(Object.fromEntries(entries));
      } catch {
        if (active) setUserMap({});
      }
    };

    fetchUsers();
    return () => {
      active = false;
    };
  }, [upcomingReservations]);

  const totalPages = Math.max(1, Math.ceil(upcomingReservations.length / rowsPerPage));
  const pagedReservations = upcomingReservations.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  return (
    <Paper sx={{ p: 3, bgcolor: "rgba(24, 26, 27, 0.9)" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" fontWeight={600}>
          Upcoming Reservations
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            views={["year", "month"]}
            openTo="month"
            label="Month"
            value={reservationMonth}
            onChange={d =>
              d && setReservationMonth(new Date(d.getFullYear(), d.getMonth(), 1))
            }
            slotProps={{ textField: { size: "small", sx: { minWidth: 120 } } }}
          />
        </LocalizationProvider>
      </Stack>

      <Divider sx={{ my: 1, borderColor: "rgba(125, 211, 252, 0.12)" }} />

      {isLoading ? (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Guest</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Check-In</TableCell>
                <TableCell>Check-Out</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedReservations.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{userMap[r.userId]?.fullName || r.userId || "Unknown"}</TableCell>
                  <TableCell>{r.roomNumber}</TableCell>
                  <TableCell>{r.checkInDate}</TableCell>
                  <TableCell>{r.checkOutDate}</TableCell>
                  <TableCell>
                    <CancelBookingButton
                      reservationId={r.id}
                      onCancel={refetch}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            size="small"
            shape="rounded"
          />
        </Box>
      )}
    </Paper>
  );
}
