package com.skillstorm.cloudlodge.models;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

//stores all payment transactions for reservations
@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    private String reservationId;
    private String transactionId;     // Stripe charge ID (ex: txn_123abc)
    private String paymentMethodId;   // Stripe payment method used (pm_xxx)

    private Double amount;            // amount charged
    private String currency;          // USD, EUR, etc.

    private Status status;            // SUCCEEDED, FAILED, REFUNDED, PENDING
    public enum Status {SUCCEEDED, FAILED, REFUNDED, PENDING}

    @CreatedDate
    private Instant createdAt;        // timestamp when payment record was created

    //default constructor
    public Payment() {}

    //getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getReservationId() { return reservationId; }
    public void setReservationId(String reservationId) { this.reservationId = reservationId; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getPaymentMethodId() { return paymentMethodId; }
    public void setPaymentMethodId(String paymentMethodId) { this.paymentMethodId = paymentMethodId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
