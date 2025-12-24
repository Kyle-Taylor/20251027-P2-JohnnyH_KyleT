import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import { createPaymentIntent, fetchStripeConfig } from "../../api/payments";

function CheckoutForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError("");
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
    } else {
      navigate("/profile");
    }
    setSubmitting(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <PaymentElement />
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 3 }}
        disabled={!stripe || submitting}
      >
        {submitting ? "Processing..." : "Pay now"}
      </Button>
    </Box>
  );
}

export default function Checkout() {
  const { reservationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
  const [publishableKey, setPublishableKey] = useState("");
  const [error, setError] = useState("");
  const [savePaymentMethod, setSavePaymentMethod] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function init(flag) {
      try {
        const config = await fetchStripeConfig();
        if (!mounted) return;
        setPublishableKey(config.publishableKey);

        const intent = await createPaymentIntent(reservationId, flag);
        if (!mounted) return;
        setClientSecret(intent.clientSecret);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unable to start payment");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init(savePaymentMethod);
    return () => {
      mounted = false;
    };
  }, [reservationId, savePaymentMethod]);

  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  if (loading) {
    return (
      <Container sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!stripePromise || !clientSecret) {
    return (
      <Container sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography>Payment cannot be initialized.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 6, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ maxWidth: 520, width: "100%", p: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Checkout
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={savePaymentMethod}
              onChange={(e) => {
                setSavePaymentMethod(e.target.checked);
                setLoading(true);
                setRefreshKey((k) => k + 1);
              }}
              style={{ width: 16, height: 16 }}
            />
            Save this card for future use
          </label>
        </Box>
        <Elements stripe={stripePromise} options={{ clientSecret }} key={`${clientSecret}-${refreshKey}`}>
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      </Paper>
    </Container>
  );
}
