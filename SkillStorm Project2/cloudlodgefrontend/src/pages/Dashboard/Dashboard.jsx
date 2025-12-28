import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  CircularProgress,
} from "@mui/material";
import { BarChart, PieChart } from "@mui/x-charts";
import Header from "../../components/Header";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import UsersTable from '../../components/UsersTable';
import CancelBookingButton from '../../components/CancelBookingButton';
import UpcomingReservations from "../../components/UpcomingReservations";
import {
  useGetDashboardQuery,
  useGetReservationsQuery,
  useGetUsersQuery,
  useGetPaymentsQuery,
} from "../../store/apiSlice";

export default function Dashboard() {
  const [sortPeriod, setSortPeriod] = useState("day"); // for stats only
  const [guestNames, setGuestNames] = useState({});
  const [reservationMonth, setReservationMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today;
  });

  const dashboardParams = useMemo(() => {
    const params = {};
    if (selectedDate) {
      const utcDate = new Date(Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      ));
      params.date = utcDate.toISOString().slice(0, 10);
    }
    if (sortPeriod) params.period = sortPeriod;
    if (reservationMonth) {
      params.reservationMonth = `${reservationMonth.getFullYear()}-${String(reservationMonth.getMonth() + 1).padStart(2, "0")}`;
    }
    return params;
  }, [selectedDate, sortPeriod, reservationMonth]);

  const { data: stats, isLoading } = useGetDashboardQuery(dashboardParams);
  const { data: reservationsData } = useGetReservationsQuery(undefined, {
    skip: !stats?.recentPayments?.length,
  });
  const { data: usersData } = useGetUsersQuery(undefined, {
    skip: !stats?.recentPayments?.length,
  });
  const { data: paymentsData } = useGetPaymentsQuery(undefined, {
    skip: !stats?.recentPayments?.length,
  });

  useEffect(() => {
    let active = true;
    async function resolveGuests() {
      if (!stats?.recentPayments?.length) {
        if (active) setGuestNames({});
        return;
      }

      try {
        const reservations = Array.isArray(reservationsData) ? reservationsData : [];
        const users = Array.isArray(usersData) ? usersData : [];
        const payments = Array.isArray(paymentsData) ? paymentsData : [];

        const reservationMap = reservations.reduce((acc, reservation) => {
          const id = reservation?.id || reservation?._id;
          if (id) {
            acc[id] = reservation;
          }
          return acc;
        }, {});

        const reservationByPaymentId = reservations.reduce((acc, reservation) => {
          if (reservation?.paymentId) {
            acc[reservation.paymentId] = reservation;
          }
          return acc;
        }, {});

        const userMap = users.reduce((acc, user) => {
          const id = user?.id || user?._id;
          if (id) {
            acc[id] = user;
          }
          return acc;
        }, {});

        const paymentReservationMap = payments.reduce((acc, payment) => {
          if (payment?.id && payment?.reservationId) {
            acc[payment.id] = payment.reservationId;
          }
          return acc;
        }, {});

        const nameMap = {};
        stats.recentPayments.forEach((payment) => {
          const reservationId =
            payment.reservationId ||
            paymentReservationMap[payment.id] ||
            null;
          const reservation =
            reservationMap[reservationId] ||
            reservationByPaymentId[payment.id] ||
            null;
          const user = reservation ? userMap[reservation.userId] : null;
          if (user?.fullName) {
            nameMap[payment.id] = user.fullName;
          }
        });

        if (active) setGuestNames(nameMap);
      } catch {
        if (active) setGuestNames({});
      }
    }

    resolveGuests();
    return () => {
      active = false;
    };
  }, [stats, reservationsData, usersData, paymentsData]);

  if (isLoading || !stats) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        maxWidth: "100%",
        background:
          "radial-gradient(circle at 10% 0%, rgba(125,211,252,0.12), transparent 40%), radial-gradient(circle at 90% 20%, rgba(96,165,250,0.12), transparent 45%), #0f1113",
      }}
    >
      <Header showSearch={false} />
      <Box sx={{ display: "flex", flex: 1, width: "100%", overflowX: "hidden" }}>
        <Box sx={{ flex: 1, width: "100%", p: { xs: 2, md: 4 } }}>
          <Paper
            sx={{
              p: { xs: 2.5, md: 3.5 },
              mb: 3,
              position: "relative",
              overflow: "hidden",
              borderRadius: 3,
              bgcolor: "rgba(24, 26, 27, 0.9)",
              border: "1px solid rgba(125, 211, 252, 0.18)",
              boxShadow: "0 24px 60px rgba(6, 15, 24, 0.45)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(135deg, rgba(125,211,252,0.15), rgba(15,17,19,0.9)), url(https://picsum.photos/1200/400?blur=2)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.4,
              }}
            />
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
              sx={{ position: "relative" }}
            >
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  CloudLodge Dashboard
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                  Live performance snapshot and reservation activity.
                </Typography>
              </Box>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={selectedDate}
                  onChange={date => date && setSelectedDate(date)}
                  closeOnSelect={false}
                  slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
                />
              </LocalizationProvider>
            </Stack>
          </Paper>
          <Grid container spacing={3}>
            {/* Occupancy Rate */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: "center", bgcolor: "rgba(24,26,27,0.9)" }}>
                <Typography variant="h6" fontWeight={600}>
                  Occupancy Rate
                </Typography>
                <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>
                  {sortPeriod === "day"
                    ? format(selectedDate, "MMMM d, yyyy")
                    : format(selectedDate, "MMMM yyyy")}
                </Typography>
                <Typography variant="h3" color="primary" fontWeight={700}>
                  {stats.occupancyRate}%
                </Typography>
                <Divider sx={{ my: 2 }} />
                <PieChart
                  series={[
                    {
                      data: [
                        { id: 0, value: stats.occupiedRooms, label: "Occupied", color: '#1976d2' },
                        { id: 1, value: stats.totalRooms - stats.occupiedRooms - stats.inactiveRooms, label: "Vacant", color: '#90caf9' },
                        { id: 2, value: stats.inactiveRooms, label: "Inactive", color: '#d32f2f' },
                      ],
                    },
                  ]}
                  width={180}
                  height={140}
                />
              </Paper>
            </Grid>
            {/* Income */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: "center", bgcolor: "rgba(24,26,27,0.9)" }}>
                <Typography variant="h6" fontWeight={600}>
                  Income
                </Typography>
                <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>
                  {sortPeriod === "day"
                    ? format(selectedDate, "MMMM d, yyyy")
                    : format(selectedDate, "MMMM yyyy")}
                </Typography>
                <Typography variant="h3" color="success.main" fontWeight={700}>
                  ${stats.income}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <BarChart
                  series={[{ data: stats.incomeHistory, label: "Income" }]}
                  xAxis={[{ data: stats.incomeLabels }]}
                  width={240}
                  height={140}
                />
              </Paper>
            </Grid>
            
            {/* Upcoming Reservations */}
            <Grid item xs={12} md={3}>
              <UpcomingReservations />
            </Grid>

            {/* Recent Payments */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, bgcolor: "rgba(24,26,27,0.9)" }}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Recent Payments
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Guest</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(Array.isArray(stats.recentPayments)
                        ? [...stats.recentPayments]
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .slice(0, 8)
                        : []).map(p => (
                        <TableRow key={p.id}>
                          <TableCell>{guestNames[p.id] || p.guestName || "Guest"}</TableCell>
                          <TableCell>${p.amount}</TableCell>
                          <TableCell>
                            <Chip
                              label={p.status}
                              color={
                                p.status === "SUCCEEDED"
                                  ? "success"
                                  : p.status === "PENDING"
                                  ? "warning"
                                  : "error"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{p.date ? p.date.slice(0, 10) : ""}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
          {/* Users Table below dashboard info */}
          <UsersTable />
        </Box>
      </Box>
    </Box>
  );
}
