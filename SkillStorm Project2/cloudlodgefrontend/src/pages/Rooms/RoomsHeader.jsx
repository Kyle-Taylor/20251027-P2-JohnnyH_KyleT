import {
  AppBar, Toolbar, Typography, Box, Paper, InputBase, IconButton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function RoomsHeader() {
  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: "white", borderBottom: "1px solid", borderColor: "divider" }}>
      <Toolbar sx={{ height: 72 }}>
        <Typography sx={{ fontWeight: 900, letterSpacing: 1, color: "#2563eb" }}>
          CloudLodge
        </Typography>

        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Paper
            sx={{
              px: 2,
              py: 0.5,
              display: "flex",
              alignItems: "center",
              width: 480,
              borderRadius: 999,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <InputBase placeholder="Search by room # or type" fullWidth />
            <IconButton>
              <SearchIcon />
            </IconButton>
          </Paper>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
