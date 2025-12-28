import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Container,
  Divider,
  Paper
} from "@mui/material";
import { GlobalStyles } from "@mui/material";
import BannerPhoto from "../../assets/images/BannerPhoto.png";
import HotelIcon from "@mui/icons-material/Hotel";
import SpaIcon from "@mui/icons-material/Spa";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import WifiIcon from "@mui/icons-material/Wifi";
import PoolIcon from "@mui/icons-material/Pool";
import StarIcon from "@mui/icons-material/Star";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useGetRoomTypesQuery } from "../../store/apiSlice";

const HIGHLIGHTS = [
  {
    title: "Skyline Suites",
    description: "Floor-to-ceiling views, private bar, and quiet work nook.",
    tag: "From $189/night",
    gradient: "linear-gradient(135deg, rgba(25,118,210,0.45), rgba(14,20,30,0.9))"
  },
  {
    title: "Garden Lofts",
    description: "Soft morning light, green terraces, and spa-ready baths.",
    tag: "From $149/night",
    gradient: "linear-gradient(135deg, rgba(76,175,80,0.35), rgba(14,20,30,0.9))"
  },
  {
    title: "Family Residences",
    description: "Connected rooms, flexible seating, and easy access to pools.",
    tag: "From $229/night",
    gradient: "linear-gradient(135deg, rgba(255,193,7,0.35), rgba(14,20,30,0.9))"
  }
];

const AMENITIES = [
  {
    icon: <SpaIcon />,
    title: "Wellness Rituals",
    detail: "Daily spa access with guided recovery sessions."
  },
  {
    icon: <RestaurantIcon />,
    title: "Skyline Dining",
    detail: "Seasonal menus and rooftop lounges."
  },
  {
    icon: <PoolIcon />,
    title: "Infinity Pools",
    detail: "Heated pools with sunrise and city-light views."
  },
  {
    icon: <WifiIcon />,
    title: "Studio-Grade Wi-Fi",
    detail: "Fast, stable connectivity in every corner."
  },
  {
    icon: <LocalTaxiIcon />,
    title: "Curated Transfers",
    detail: "Private arrivals and city tours on demand."
  },
  {
    icon: <HotelIcon />,
    title: "Signature Service",
    detail: "Concierge teams that remember your preferences."
  },
  {
    icon: <RestaurantIcon />,
    title: "Cafe All Day",
    detail: "Artisan coffee, light bites, and late-night sweets."
  },
  {
    icon: <SpaIcon />,
    title: "Sunset Lounge",
    detail: "Fireside seating with skyline and garden views."
  }
];

const STATS = [
  { label: "Suites & rooms", value: "148" },
  { label: "Average rating", value: "4.9", star: true },
  { label: "Onsite dining", value: "4.7", star: true }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomTypeError, setRoomTypeError] = useState("");
  const { data, error } = useGetRoomTypesQuery();

  useEffect(() => {
    if (Array.isArray(data)) {
      setRoomTypes(data);
      setRoomTypeError("");
    } else if (data) {
      setRoomTypes([]);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      setRoomTypes([]);
      setRoomTypeError(error?.message || "Failed to fetch room types");
    }
  }, [error]);

  const roomTypeCards = useMemo(() => {
    if (!roomTypes.length) return HIGHLIGHTS;
    const picks = roomTypes.filter((_, index) => index % 2 === 0).slice(0, 3);
    return picks.map((roomType, index) => {
      const fallback = HIGHLIGHTS[index % HIGHLIGHTS.length];
      return {
        title: roomType.roomCategory || fallback.title,
        description: roomType.description || fallback.description,
        tag: roomType.pricePerNight
          ? `From $${roomType.pricePerNight}/night`
          : fallback.tag,
        gradient: fallback.gradient,
        image: roomType.images?.[0] || null
      };
    });
  }, [roomTypes]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        "--landing-accent": "#7dd3fc",
        "--landing-accent-2": "#60a5fa",
        "--landing-muted": "#9aa4b2",
        "--landing-surface": "#1f2428",
        "@keyframes fadeUp": {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" }
        },
        "@keyframes float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        }
      }}
    >
      <GlobalStyles
        styles={`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Manrope:wght@400;600;700&display=swap');`}
      />

      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 14 }
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(120deg, rgba(9,12,15,0.92) 20%, rgba(9,12,15,0.45) 65%), url(${BannerPhoto})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.95
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(125,211,252,0.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(96,165,250,0.2), transparent 35%)"
          }}
        />

        <Container
          maxWidth={false}
          disableGutters
          sx={{
            position: "relative",
            zIndex: 1,
            px: { xs: 3, md: 8, lg: 12 }
          }}
        >
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="CloudLodge Signature Collection"
                sx={{
                  bgcolor: "rgba(125,211,252,0.15)",
                  color: "var(--landing-accent)",
                  border: "1px solid rgba(125,211,252,0.35)",
                  mb: 2,
                  letterSpacing: 0.5
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: { xs: 34, sm: 44, md: 56 },
                  lineHeight: 1.1,
                  maxWidth: 560,
                  animation: "fadeUp 0.9s ease both"
                }}
              >
                A sky-high retreat designed for quiet confidence.
              </Typography>
              <Typography
                sx={{
                  mt: 2,
                  color: "var(--landing-muted)",
                  maxWidth: 520,
                  fontSize: { xs: 15, md: 17 },
                  fontFamily: "'Manrope', sans-serif",
                  animation: "fadeUp 0.9s ease 0.1s both"
                }}
              >
                CloudLodge blends warm hospitality with purposeful design. Plan
                stays, host teams, and reset between city adventures with
                effortless service.
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mt: 4, animation: "fadeUp 0.9s ease 0.2s both" }}
              >
              </Stack>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                sx={{ mt: 4 }}
              >
                {STATS.map((stat) => (
                  <Box key={stat.label}>
                    <Typography
                      sx={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "var(--landing-accent)"
                      }}
                    >
                      <Box
                        component="span"
                        sx={{ display: "inline-flex", alignItems: "center" }}
                      >
                        {stat.star && (
                          <StarIcon sx={{ fontSize: 18, mr: 0.5 }} />
                        )}
                        {stat.value}
                      </Box>
                    </Typography>
                    <Typography
                      sx={{ color: "var(--landing-muted)", fontSize: 13 }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: "rgba(24,26,27,0.75)",
                  border: "1px solid rgba(125,211,252,0.2)",
                  borderRadius: 3,
                  backdropFilter: "blur(10px)",
                  animation: "fadeUp 0.9s ease 0.15s both"
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 600
                  }}
                >
                  Plan a city retreat
                </Typography>
                <Typography sx={{ color: "var(--landing-muted)", mt: 1 }}>
                  Flexible reservations, team-ready suites, and fast check-in
                  make every stay calm and predictable.
                </Typography>
                <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.1)" }} />
                <Stack spacing={2}>
                  {[
                    "Curated experiences for teams and families",
                    "Onsite dining with late-night service",
                    "Concierge support for every itinerary"
                  ].map((item, idx) => (
                    <Stack
                      key={item}
                      direction="row"
                      spacing={1.5}
                      sx={{
                        alignItems: "center",
                        animation: "fadeUp 0.8s ease both",
                        animationDelay: `${0.1 + idx * 0.1}s`
                      }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: "var(--landing-accent)"
                        }}
                      />
                      <Typography sx={{ color: "text.secondary" }}>
                        {item}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        <Container
          maxWidth={false}
          disableGutters
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            px: { xs: 3, md: 8, lg: 12 },
            pt: { xs: 3, md: 4 },
            zIndex: 2
          }}
        >
          <Stack
            direction="row"
            sx={{
              gap: 1,
              bgcolor: "rgba(24,26,27,0.7)",
              border: "1px solid rgba(125,211,252,0.25)",
              borderRadius: 999,
              p: 1.2
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/login")}
              sx={{ color: "#fff", px: 2.5 }}
            >
              Sign In
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/register")}
              sx={{ color: "#fff", px: 2.5 }}
            >
              Create Account
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container
        maxWidth={false}
        disableGutters
        sx={{ py: { xs: 6, md: 8 }, px: { xs: 3, md: 8, lg: 12 } }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700
              }}
            >
              Signature stays
            </Typography>
            <Typography sx={{ color: "var(--landing-muted)", mt: 1 }}>
              {roomTypes.length
                ? "Explore real room types available right now."
                : "Each collection is curated for a specific kind of escape."}
            </Typography>
          </Box>
          <Button
            variant="text"
            onClick={() => navigate("/create-reservation")}
            sx={{ color: "var(--landing-accent)" }}
          >
            Build a reservation
          </Button>
        </Stack>
        {roomTypeError && (
          <Typography sx={{ color: "var(--landing-muted)", mb: 2 }}>
            {roomTypeError}
          </Typography>
        )}
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, minmax(0, 1fr))"
            }
          }}
        >
          {roomTypeCards.map((card, idx) => (
            <Box key={card.title}>
              <Card
                sx={{
                  height: "100%",
                  minHeight: 260,
                  borderRadius: 3,
                  bgcolor: "var(--landing-surface)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  overflow: "hidden",
                  position: "relative",
                  animation: "fadeUp 0.8s ease both",
                  animationDelay: `${idx * 0.15}s`,
                  "&:hover": { transform: "translateY(-4px)" }
                }}
              >
                <Box
                  sx={{
                    height: 110,
                    backgroundImage: card.image
                      ? `linear-gradient(135deg, rgba(10,12,15,0.25), rgba(10,12,15,0.9)), url(${card.image})`
                      : card.gradient,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative"
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      right: 16,
                      top: 18,
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      border: "1px solid rgba(125,211,252,0.4)",
                      animation: "float 3s ease-in-out infinite"
                    }}
                  />
                </Box>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography sx={{ color: "var(--landing-muted)", mb: 2 }}>
                    {card.description}
                  </Typography>
                  <Chip
                    label={card.tag}
                    size="small"
                    sx={{
                      bgcolor: "rgba(125,211,252,0.15)",
                      color: "var(--landing-accent)",
                      border: "1px solid rgba(125,211,252,0.35)"
                    }}
                  />
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      <Box sx={{ bgcolor: "#1c2126", py: { xs: 6, md: 8 } }}>
        <Container
          maxWidth={false}
          disableGutters
          sx={{ px: { xs: 3, md: 8, lg: 12 } }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              mb: 1
            }}
          >
            Experiences that move with you
          </Typography>
          <Typography sx={{ color: "var(--landing-muted)", mb: 4 }}>
            Every detail is designed for comfort, clarity, and quiet momentum.
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))"
              }
            }}
          >
            {AMENITIES.map((item, idx) => (
              <Box
                key={item.title}
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 2,
                  bgcolor: "#23272a",
                  border: "1px solid rgba(255,255,255,0.06)",
                  animation: "fadeUp 0.8s ease both",
                  animationDelay: `${0.05 + idx * 0.1}s`
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(125,211,252,0.12)",
                    color: "var(--landing-accent)"
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography sx={{ color: "var(--landing-muted)", mt: 1 }}>
                  {item.detail}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Box sx={{ bgcolor: "#171b1f", py: { xs: 7, md: 9 } }}>
        <Container
          maxWidth={false}
          disableGutters
          sx={{ px: { xs: 3, md: 8, lg: 12 } }}
        >
          <Box
            sx={{
              borderRadius: 4,
              border: "1px solid rgba(125,211,252,0.2)",
              background:
                "linear-gradient(120deg, rgba(18,22,26,0.92), rgba(24,30,36,0.96))",
              p: { xs: 4, md: 6 },
              position: "relative",
              overflow: "hidden"
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "radial-gradient(circle at 10% 20%, rgba(125,211,252,0.18), transparent 40%)"
              }}
            />
            <Grid
              container
              spacing={4}
              alignItems="stretch"
              sx={{ position: "relative" }}
            >
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 700
                    }}
                  >
                    Contact us
                  </Typography>
                  <Typography sx={{ color: "var(--landing-muted)" }}>
                    Need a custom stay, long-term booking, or event space? Our
                    concierge team replies within one business day.
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      component="a"
                      href="mailto:hello@cloudlodge.com"
                    >
                      Email concierge
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      component="a"
                      href="tel:+14155550182"
                      sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.35)" }}
                    >
                      Call now
                    </Button>
                  </Stack>
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "rgba(24,26,27,0.8)",
                      border: "1px solid rgba(255,255,255,0.08)"
                    }}
                  >
                    <Typography sx={{ color: "var(--landing-muted)" }}>
                      Available Mon–Sat, 9am–7pm PT
                    </Typography>
                    <Typography sx={{ color: "var(--landing-muted)" }}>
                      Prefer email? Expect a reply within 24 hours.
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        height: "100%",
                        bgcolor: "#23272a",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 2
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <EmailIcon sx={{ color: "var(--landing-accent)" }} />
                          <Typography fontWeight={600}>Email</Typography>
                        </Stack>
                        <Typography sx={{ color: "var(--landing-muted)" }}>
                          hello@cloudlodge.com
                        </Typography>
                        <Typography sx={{ color: "var(--landing-muted)" }}>
                          partnerships@cloudlodge.com
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        height: "100%",
                        bgcolor: "#23272a",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 2
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <PhoneIcon sx={{ color: "var(--landing-accent)" }} />
                          <Typography fontWeight={600}>Phone</Typography>
                        </Stack>
                        <Typography sx={{ color: "var(--landing-muted)" }}>
                          +1 (415) 555-0182
                        </Typography>
                        <Typography sx={{ color: "var(--landing-muted)" }}>
                          Mon–Sat, 9am–7pm PT
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        height: "100%",
                        bgcolor: "#23272a",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 2
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <LocationOnIcon
                            sx={{ color: "var(--landing-accent)" }}
                          />
                          <Typography fontWeight={600}>Visit</Typography>
                        </Stack>
                        <Typography sx={{ color: "var(--landing-muted)" }}>
                          88 Market Street, Suite 1200
                        </Typography>
                        <Typography sx={{ color: "var(--landing-muted)" }}>
                          San Francisco, CA 94105
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

    </Box>
  );
}
