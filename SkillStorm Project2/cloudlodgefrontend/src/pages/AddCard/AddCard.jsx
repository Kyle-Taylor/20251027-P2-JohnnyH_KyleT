import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Box, Button, CircularProgress, Container, Paper, Typography } from "@mui/material";
import { useCreateSetupIntentMutation, useGetStripeConfigQuery } from "../../store/apiSlice";

function AddCardForm({ clientSecret }) {
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
    const { error: confirmError } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });
    if (confirmError) {
      setError(confirmError.message || "Failed to save card");
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
        {submitting ? "Saving..." : "Save card"}
      </Button>
    </Box>
  );
}

export default function AddCard() {
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
  const [publishableKey, setPublishableKey] = useState("");
  const [error, setError] = useState("");
  const { data: configData, error: configError } = useGetStripeConfigQuery();
  const [createSetupIntent] = useCreateSetupIntentMutation();

  useEffect(() => {
    if (!configData && !configError) return;
    let mounted = true;
    async function init() {
      try {
        if (configError) {
          throw configError;
        }
        if (!mounted) return;
        setPublishableKey(configData?.publishableKey || "");
        const setup = await createSetupIntent().unwrap();
        if (!mounted) return;
        setClientSecret(setup.clientSecret);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Unable to start add card flow");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, [configData, configError, createSetupIntent]);

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
        <Typography>Unable to initialize payment element.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 6, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ maxWidth: 520, width: "100%", p: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Add Payment Method
        </Typography>
        <Elements stripe={stripePromise} options={{ clientSecret }} key={clientSecret}>
          <AddCardForm clientSecret={clientSecret} />
        </Elements>
      </Paper>
    </Container>
  );
}
