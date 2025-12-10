package com.skillstorm.cloudlodge.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.skillstorm.cloudlodge.models.Payment;
import com.skillstorm.cloudlodge.repositories.PaymentRepository;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    // Get all payments
    public List<Payment> findAll() {
        return paymentRepository.findAll();
    }

    // Get payment by ID
    public Optional<Payment> findById(String id) {
        return paymentRepository.findById(id);
    }

    // Get all payments for a reservation
    public List<Payment> findByReservationId(String reservationId) {
        return paymentRepository.findByReservationId(reservationId);
    }

    // Get payment by Stripe transaction ID
    public Optional<Payment> findByTransactionId(String txnId) {
        return Optional.ofNullable(paymentRepository.findByTransactionId(txnId));
    }

    // Create or update payment
    public Payment save(Payment payment) {
        return paymentRepository.save(payment);
    }

    // Delete payment
    public void delete(String id) {
        paymentRepository.deleteById(id);
    }
}
