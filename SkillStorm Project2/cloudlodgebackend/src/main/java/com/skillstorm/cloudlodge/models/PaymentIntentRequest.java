package com.skillstorm.cloudlodge.models;

public class PaymentIntentRequest {
    private String reservationId;
    private boolean savePaymentMethod;

    public PaymentIntentRequest() {}

    public String getReservationId() {
        return reservationId;
    }

    public void setReservationId(String reservationId) {
        this.reservationId = reservationId;
    }

    public boolean isSavePaymentMethod() {
        return savePaymentMethod;
    }

    public void setSavePaymentMethod(boolean savePaymentMethod) {
        this.savePaymentMethod = savePaymentMethod;
    }
}
