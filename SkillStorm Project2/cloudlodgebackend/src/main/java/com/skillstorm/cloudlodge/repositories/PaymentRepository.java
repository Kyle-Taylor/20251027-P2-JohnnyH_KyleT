package com.skillstorm.cloudlodge.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.cloudlodge.models.Payment;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {

    // Find all payments related to a reservation
    List<Payment> findByReservationId(String reservationId);

    // Find payment by Stripe transaction ID
    Payment findByTransactionId(String transactionId);
}
