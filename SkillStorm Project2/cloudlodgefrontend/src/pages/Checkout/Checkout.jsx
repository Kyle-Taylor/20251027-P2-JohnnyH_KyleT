import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { useCreatePaymentIntentMutation, useGetStripeConfigQuery } from "../../store/apiSlice";

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
  const { data: configData, error: configError } = useGetStripeConfigQuery();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();

  useEffect(() => {
    if (!configData && !configError) return;
    let mounted = true;
    async function init(flag) {
      try {
        if (configError) {
          throw configError;
        }
        if (!mounted) return;
        setPublishableKey(configData?.publishableKey || "");

        const intent = await createPaymentIntent({ reservationId, savePaymentMethod: flag }).unwrap();
        if (!mounted) return;
        setClientSecret(intent.clientSecret);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Unable to start payment");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init(savePaymentMethod);
    return () => {
      mounted = false;
    };
  }, [reservationId, savePaymentMethod, createPaymentIntent, configData, configError]);

  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 20% 20%, rgba(125,211,252,0.16), transparent 45%), radial-gradient(circle at 80% 30%, rgba(96,165,250,0.16), transparent 50%), #0f1113",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 20% 20%, rgba(125,211,252,0.16), transparent 45%), radial-gradient(circle at 80% 30%, rgba(96,165,250,0.16), transparent 50%), #0f1113",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!stripePromise || !clientSecret) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 20% 20%, rgba(125,211,252,0.16), transparent 45%), radial-gradient(circle at 80% 30%, rgba(96,165,250,0.16), transparent 50%), #0f1113",
        }}
      >
        <Typography>Payment cannot be initialized.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 8,
        display: "flex",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 20% 20%, rgba(125,211,252,0.16), transparent 45%), radial-gradient(circle at 80% 30%, rgba(96,165,250,0.16), transparent 50%), #0f1113",
      }}
    >
      <Paper sx={{ maxWidth: 520, width: "100%", p: 4, bgcolor: "rgba(24, 26, 27, 0.9)" }}>
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
    </Box>
  );
}
