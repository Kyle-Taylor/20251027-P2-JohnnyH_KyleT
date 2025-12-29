import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Stack,
} from "@mui/material";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  useCreateSetupIntentMutation,
  useGetStripeConfigQuery,
} from "../../store/apiSlice";

function InnerPaymentForm({
  clientSecret,
  onSuccess,
  onClose,
  showSaveCardToggle,
  primaryCtaLabel,
  saveCard,
  setSaveCard,
}) {
  const stripe = useStripe();
  const elements = useElements();
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
      setError(confirmError.message || "Payment method failed");
    } else {
      onSuccess?.();
      onClose?.();
    }
    setSubmitting(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <PaymentElement />
      {showSaveCardToggle && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
          <input
            type="checkbox"
            checked={saveCard}
            onChange={(e) => setSaveCard(e.target.checked)}
            style={{ width: 16, height: 16 }}
          />
          <Typography variant="body2">Save this card to my account</Typography>
        </Box>
      )}
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
        {submitting ? "Saving..." : primaryCtaLabel}
      </Button>
    </Box>
  );
}

export default function PaymentModal({
  open,
  onClose,
  onSuccess,
  title = "Checkout",
  savedCards = [],
  allowSavedSelection = true,
  showSaveCardToggle = false,
  primaryCtaLabel = "Save payment method",
}) {
  const { data: configData, isFetching: configLoading } = useGetStripeConfigQuery(undefined, {
    skip: !open,
  });
  const [createSetupIntent] = useCreateSetupIntentMutation();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useExisting, setUseExisting] = useState(savedCards?.length > 0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(savedCards?.[0]?.stripePaymentMethodId || "");
  const [saveCard, setSaveCard] = useState(true);

  useEffect(() => {
    const hasSaved = allowSavedSelection && savedCards?.length > 0;
    setUseExisting(hasSaved);
    setSelectedPaymentMethod(hasSaved ? savedCards?.[0]?.stripePaymentMethodId || "" : "");
  }, [savedCards, allowSavedSelection]);

  useEffect(() => {
    let mounted = true;
    async function init() {
      if (!open || useExisting) return;
      setLoading(true);
      setError("");
      try {
        const resp = await createSetupIntent().unwrap();
        if (!mounted) return;
        setClientSecret(resp?.clientSecret || "");
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Unable to start payment");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => {
      mounted = false;
      setClientSecret("");
    };
  }, [open, createSetupIntent, useExisting]);

  const stripePromise = useMemo(() => {
    if (!configData?.publishableKey) return null;
    return loadStripe(configData.publishableKey);
  }, [configData]);

  const ready = useExisting || (!loading && !configLoading && stripePromise && clientSecret);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: "rgba(24, 26, 27, 0.95)",
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose a saved card or add a new one securely with Stripe.
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {allowSavedSelection && savedCards?.length > 0 && (
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {savedCards.map((card, idx) => (
              <Box
                key={card.stripePaymentMethodId || idx}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: "1px solid rgba(255,255,255,0.1)",
                  bgcolor: useExisting && selectedPaymentMethod === card.stripePaymentMethodId
                    ? "rgba(125,211,252,0.12)"
                    : "transparent",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setUseExisting(true);
                  setSelectedPaymentMethod(card.stripePaymentMethodId);
                }}
              >
                <Typography fontWeight={600}>{card.brand || "Card"} •••• {card.last4 || "----"}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Expires {card.expMonth || "--"}/{card.expYear || "--"}
                </Typography>
              </Box>
            ))}
            <Button variant="text" onClick={() => setUseExisting(false)} sx={{ alignSelf: "flex-start" }}>
              + Use a new card
            </Button>
          </Stack>
        )}
        {!ready && !useExisting ? (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Stack>
        ) : !useExisting ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <InnerPaymentForm
              onSuccess={onSuccess}
              onClose={onClose}
              clientSecret={clientSecret}
              showSaveCardToggle={showSaveCardToggle}
              primaryCtaLabel={primaryCtaLabel}
              saveCard={saveCard}
              setSaveCard={setSaveCard}
            />
          </Elements>
        ) : null}
        {allowSavedSelection && useExisting && savedCards?.length > 0 && (
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 1 }}
            disabled={!selectedPaymentMethod}
            onClick={() => {
              onSuccess?.({ paymentMethodId: selectedPaymentMethod });
              onClose?.();
            }}
          >
            Use selected card
          </Button>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
