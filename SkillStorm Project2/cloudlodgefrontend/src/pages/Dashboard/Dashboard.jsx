import React, { useEffect, useState } from "react";
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
import { apiFetch } from "../../api/apiFetch";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [sortPeriod, setSortPeriod] = useState("day"); // for stats only
  const [reservationMonth, setReservationMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today;
  });

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line
  }, [sortPeriod, selectedDate]);

  // Fetch only upcoming reservations when reservationMonth changes
  useEffect(() => {
    async function fetchUpcoming() {
      setLoadingUpcoming(true);
      try {
        const params = new URLSearchParams();
        if (reservationMonth) {
          params.append("reservationMonth", `${reservationMonth.getFullYear()}-${String(reservationMonth.getMonth() + 1).padStart(2, '0')}`);
        }
        const data = await apiFetch(`/dashboard?${params.toString()}`);
        setUpcomingReservations(data.upcomingReservations || []);
      } catch (err) {
        setUpcomingReservations([]);
      } finally {
        setLoadingUpcoming(false);
      }
    }
    fetchUpcoming();
    // eslint-disable-next-line
  }, [reservationMonth]);

  async function fetchDashboard() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate) {
        // Always send the date as UTC YYYY-MM-DD
        const utcDate = new Date(Date.UTC(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        ));
        params.append("date", utcDate.toISOString().slice(0, 10));
      }
      if (sortPeriod) params.append("period", sortPeriod);
      if (reservationMonth) {
        // Send as yyyy-MM
        params.append("reservationMonth", `${reservationMonth.getFullYear()}-${String(reservationMonth.getMonth() + 1).padStart(2, '0')}`);
      }
      const data = await apiFetch(`/dashboard?${params.toString()}`);
      setStats(data);
    } catch (err) {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", width: "100vw", maxWidth: "100%" }}>
      <Header showSearch={false} />
      <Box sx={{ display: "flex", flex: 1, width: "100%", overflowX: "hidden" }}>
        <Box sx={{ flex: 1, width: "100%", p: { xs: 2, md: 4 } }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={3}>
            <Typography variant="h4" fontWeight={700}>
              CloudLodge Dashboard
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={selectedDate}
                onChange={date => date && setSelectedDate(date)}
                slotProps={{ textField: { size: 'small', sx: { minWidth: 140 } } }}
              />
            </LocalizationProvider>
          </Stack>
          <Grid container spacing={3}>
            {/* Occupancy Rate */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: "center" }}>
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
              <Paper sx={{ p: 3, textAlign: "center" }}>
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
                  width={"100%"}
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
              <Paper sx={{ p: 3 }}>
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
                      {stats.recentPayments.map(p => (
                        <TableRow key={p.id}>
                          <TableCell>{p.guestName}</TableCell>
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
                          <TableCell>{p.date}</TableCell>
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
