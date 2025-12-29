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
  Pagination,
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
  const [paymentsPage, setPaymentsPage] = useState(1);
  const paymentsPerPage = 11;

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

  const { data: stats, isLoading } = useGetDashboardQuery(dashboardParams, {
    pollingInterval: 15000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const { data: reservationsData } = useGetReservationsQuery(undefined, {
    skip: !stats?.recentPayments?.length,
  });
  const { data: usersData } = useGetUsersQuery(undefined, {
    skip: !stats?.recentPayments?.length,
  });
  const { data: paymentsData } = useGetPaymentsQuery(undefined, {
    skip: !stats?.recentPayments?.length,
  });

  const sortedPayments = useMemo(() => {
    if (!Array.isArray(stats?.recentPayments)) return [];
    return [...stats.recentPayments].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [stats]);
  const paymentsTotalPages = Math.max(1, Math.ceil(sortedPayments.length / paymentsPerPage));
  const pagedPayments = sortedPayments.slice(
    (paymentsPage - 1) * paymentsPerPage,
    paymentsPage * paymentsPerPage
  );

  useEffect(() => {
    if (paymentsPage > paymentsTotalPages) {
      setPaymentsPage(1);
    }
  }, [paymentsPage, paymentsTotalPages]);

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
          "radial-gradient(circle at 10% 0%, rgba(125,211,252,0.16), transparent 45%), radial-gradient(circle at 90% 20%, rgba(96,165,250,0.16), transparent 45%), #0f1113",
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
              bgcolor: "rgba(21, 26, 31, 0.92)",
              border: "1px solid rgba(125, 211, 252, 0.2)",
              boxShadow: "0 28px 60px rgba(6, 15, 24, 0.5)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(135deg, rgba(125,211,252,0.2), rgba(15,17,19,0.92)), url(https://picsum.photos/1200/400?blur=2)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.4,
              }}
            />
            <Box sx={{ position: "relative" }}>
              <Typography variant="h4" fontWeight={700}>
                CloudLodge Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                Live performance snapshot and reservation activity.
              </Typography>
            </Box>
          </Paper>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "auto 1fr" },
              gap: 3,
              mt: 1,
              mb: 8,
            }}
          >
            {/* Left side - Occupancy and Income with Date Picker wrapped in a Paper */}
            <Paper 
              sx={{ 
                p: 3, 
                bgcolor: "rgba(21,26,31,0.92)", 
                border: "1px solid rgba(125,211,252,0.16)",
                minWidth: { md: 570 }
              }}
            >
              <Box
                sx={{
                  mb: 3,
                  textAlign: "center",
                }}
              >
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Select Date
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={selectedDate}
                    onChange={date => date && setSelectedDate(date)}
                    closeOnSelect={false}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: {
                          minWidth: 180,
                          bgcolor: "rgba(15, 17, 19, 0.6)",
                          borderRadius: 2,
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "rgba(125, 211, 252, 0.3)"
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(125, 211, 252, 0.5)"
                            }
                          }
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 3,
                }}
              >
                <Paper sx={{ p: 3, textAlign: "center", bgcolor: "rgba(15,17,19,0.6)", border: "1px solid rgba(125,211,252,0.1)" }}>
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
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <PieChart
                      series={[
                        {
                          data: [
                            { id: 0, value: stats.occupiedRooms, label: "Occupied", color: '#7dd3fc' },
                            { id: 1, value: stats.totalRooms - stats.occupiedRooms - stats.inactiveRooms, label: "Vacant", color: '#4ea8f3' },
                            { id: 2, value: stats.inactiveRooms, label: "Inactive", color: '#d32f2f' },
                          ],
                        },
                      ]}
                      width={180}
                      height={140}
                    />
                  </Box>
                </Paper>

                <Paper sx={{ p: 3, textAlign: "center", bgcolor: "rgba(15,17,19,0.6)", border: "1px solid rgba(125,211,252,0.1)" }}>
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
                    series={[{ data: stats.incomeHistory, label: "Income", color: "#7dd3fc" }]}
                    xAxis={[{ data: stats.incomeLabels }]}
                    width={240}
                    height={140}
                  />
                </Paper>
              </Box>
            </Paper>

            {/* Right side - Recent Payments (takes remaining space) */}
            <Paper sx={{ p: 3, bgcolor: "rgba(21,26,31,0.92)", border: "1px solid rgba(125,211,252,0.14)" }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Recent Payments
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "rgba(15, 17, 19, 0.6)" }}>
                      <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Guest</TableCell>
                      <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedPayments.map(p => (
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
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2, minHeight: 40 }}>
                <Pagination
                  count={paymentsTotalPages}
                  page={paymentsPage}
                  onChange={(_, value) => setPaymentsPage(value)}
                  size="small"
                  shape="rounded"
                />
              </Box>
            </Paper>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
              mt: 8,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <UsersTable />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <UpcomingReservations />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
