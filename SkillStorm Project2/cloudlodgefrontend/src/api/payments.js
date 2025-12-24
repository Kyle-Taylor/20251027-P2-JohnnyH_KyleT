import { apiFetch } from "./apiFetch";

export async function fetchStripeConfig() {
  return apiFetch("/payments/config");
}

export async function createPaymentIntent(reservationId, savePaymentMethod = false) {
  return apiFetch("/payments/intent", {
    method: "POST",
    body: { reservationId, savePaymentMethod }
  });
}

export async function deletePaymentMethod(paymentMethodId) {
  return apiFetch(`/payments/methods/${paymentMethodId}`, {
    method: "DELETE"
  });
}

export async function createSetupIntent() {
  return apiFetch("/payments/setup-intent", { method: "POST" });
}
