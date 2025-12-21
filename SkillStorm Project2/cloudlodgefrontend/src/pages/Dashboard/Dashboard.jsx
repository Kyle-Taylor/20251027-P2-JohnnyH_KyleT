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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { BarChart, PieChart } from "@mui/x-charts";
import Header from "../../components/Header";
import SideNav from "../../components/SideNav";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import UsersTable from '../../components/UsersTable';

const API_URL = "http://localhost:8080/";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [sortPeriod, setSortPeriod] = useState("day");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today;
  });

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line
  }, [sortPeriod, selectedDate]);

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
      const res = await fetch(`${API_URL}dashboard?${params.toString()}`);
      const data = await res.json();
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
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header showSearch={false} />
      <Box sx={{ display: "flex", flex: 1 }}>
        <SideNav />
        <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
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
                        { id: 0, value: stats.occupiedRooms, label: "Occupied" },
                        { id: 1, value: stats.totalRooms - stats.occupiedRooms, label: "Vacant" },
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
                  width={180}
                  height={140}
                />
              </Paper>
            </Grid>
            {/* Inactive Rooms */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6" fontWeight={600}>
                  Inactive Rooms
                </Typography>
                <Typography variant="h3" color="error.main" fontWeight={700}>
                  {stats.inactiveRooms}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Chip label="Under Maintenance" color="warning" />
              </Paper>
            </Grid>
            {/* Upcoming Reservations */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={600}>
                    Upcoming Reservations
                  </Typography>
                  <FormControl size="small">
                    <InputLabel>Sort</InputLabel>
                    <Select
                      value={sortPeriod}
                      label="Sort"
                      onChange={e => setSortPeriod(e.target.value)}
                    >
                      <MenuItem value="day">Day</MenuItem>
                      <MenuItem value="month">Month</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                <Divider sx={{ my: 1 }} />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Guest</TableCell>
                        <TableCell>Room</TableCell>
                        <TableCell>Check-In</TableCell>
                        <TableCell>Check-Out</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.upcomingReservations.map(r => (
                        <TableRow key={r.id}>
                          <TableCell>{r.guestName}</TableCell>
                          <TableCell>{r.roomNumber}</TableCell>
                          <TableCell>{r.checkInDate}</TableCell>
                          <TableCell>{r.checkOutDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
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