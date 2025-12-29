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
  useCreatePaymentIntentMutation,
  useChargeSavedPaymentMethodMutation,
} from "../../store/apiSlice";

export const BrandIcon = ({ brand }) => {
  const b = (brand || "").toLowerCase();
  if (b.includes("visa")) {
    return (
      <svg width="32" height="20" viewBox="0 0 32 20" aria-label="Visa">
        <rect width="32" height="20" rx="3" fill="#1A1F71" />
        <text x="6" y="14" fill="#fff" fontSize="12" fontWeight="700">VISA</text>
      </svg>
    );
  }
  if (b.includes("master")) {
    return (
      <svg width="32" height="20" viewBox="0 0 32 20" aria-label="Mastercard">
        <circle cx="12" cy="10" r="8" fill="#EB001B" />
        <circle cx="20" cy="10" r="8" fill="#F79E1B" />
      </svg>
    );
  }
  if (b.includes("amex") || b.includes("american")) {
    return (
      <svg width="32" height="20" viewBox="0 0 32 20" aria-label="Amex">
        <rect width="32" height="20" rx="3" fill="#2E77BC" />
        <text x="5" y="14" fill="#fff" fontSize="10" fontWeight="700">AMEX</text>
      </svg>
    );
  }
  if (b.includes("discover")) {
    return (
      <svg width="32" height="20" viewBox="0 0 32 20" aria-label="Discover">
        <rect width="32" height="20" rx="3" fill="#F76C0F" />
        <text x="3" y="14" fill="#fff" fontSize="9" fontWeight="700">DISC</text>
      </svg>
    );
  }
  return null;
};

function InnerPaymentForm({
  clientSecret,
  onSuccess,
  onClose,
  showSaveCardToggle,
  primaryCtaLabel,
  saveCard,
  setSaveCard,
  mode = "setup",
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
    if (mode === "payment") {
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      if (result.error) {
        setError(result.error.message || "Payment failed");
      } else {
        onSuccess?.({ paymentIntentId: result.paymentIntent?.id });
        onClose?.();
      }
    } else {
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
  mode = "setup", // "setup" or "payment"
  amount,
  description,
}) {
  const { data: configData, isFetching: configLoading } = useGetStripeConfigQuery(undefined, {
    skip: !open,
  });
  const [createSetupIntent] = useCreateSetupIntentMutation();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const [chargeSavedPaymentMethod] = useChargeSavedPaymentMethodMutation();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
        if (mode === "payment") {
          const resp = await createPaymentIntent({
            amount,
            description: description || "Payment",
            savePaymentMethod: saveCard,
          }).unwrap();
          if (!mounted) return;
          setClientSecret(resp?.clientSecret || "");
        } else {
          const resp = await createSetupIntent().unwrap();
          if (!mounted) return;
          setClientSecret(resp?.clientSecret || "");
        }
      } catch (err) {
        if (!mounted) return;
        setError(err?.data || err?.message || "Unable to start payment");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => {
      mounted = false;
      setClientSecret("");
    };
  }, [open, mode, amount, description, saveCard, createSetupIntent, createPaymentIntent, useExisting]);

  const stripePromise = useMemo(() => {
    if (!configData?.publishableKey) return null;
    return loadStripe(configData.publishableKey);
  }, [configData]);

  const ready = useExisting || (!loading && !configLoading && stripePromise && clientSecret);

  const handleUseSavedCard = async () => {
    if (mode === "payment" && amount) {
      setSubmitting(true);
      setError("");
      try {
        const result = await chargeSavedPaymentMethod({
          paymentMethodId: selectedPaymentMethod,
          amount,
          description: description || "Payment",
        }).unwrap();
        onSuccess?.({ paymentIntentId: result.paymentIntentId });
        onClose?.();
      } catch (err) {
        setError(err?.data || err?.message || "Payment failed");
      } finally {
        setSubmitting(false);
      }
    } else {
      onSuccess?.({ paymentMethodId: selectedPaymentMethod });
      onClose?.();
    }
  };

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
        <Typography component="span" variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Typography component="div" variant="body2" color="text.secondary">
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
                <Stack direction="row" spacing={1} alignItems="center">
                  <BrandIcon brand={card.brand} />
                  <Typography fontWeight={600}>•••• {card.last4 || "----"}</Typography>
                </Stack>
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
              mode={mode}
            />
          </Elements>
        ) : null}
        {allowSavedSelection && useExisting && savedCards?.length > 0 && (
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 1 }}
            disabled={!selectedPaymentMethod || submitting}
            onClick={handleUseSavedCard}
          >
            {submitting ? "Processing..." : "Use selected card"}
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
