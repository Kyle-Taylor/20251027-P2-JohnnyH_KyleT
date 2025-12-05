package com.skillstorm.cloudlodge.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.cloudlodge.models.Payment;
import com.skillstorm.cloudlodge.services.PaymentService;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // GET all payments
    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        try {
            List<Payment> payments = paymentService.findAll();
            return new ResponseEntity<>(payments, HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .header("Error", e.getMessage())
                .build();
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Error", "Sorry! We have an internal Error! Please check back later.")
                .build();
        }
    }

    // GET /payments/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable String id) {
        try {
            Payment payment = paymentService.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Payment not found with id " + id));
            return new ResponseEntity<>(payment, HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header("Error", e.getMessage())
                    .build();
        }
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Error", "Sorry! We have an internal Error! Please check back later.")
                .build();
        }
    }

    // GET /payments/reservation/{reservationId}
    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<List<Payment>> getPaymentsByReservation(@PathVariable String reservationId) {
        try {
            List<Payment> payments = paymentService.findByReservationId(reservationId);
            return new ResponseEntity<>(payments, HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .header("Error", e.getMessage())
                .build();
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Error", "Sorry! We have an internal Error! Please check back later.")
                .build();
        }
    }

    // GET /payments/transaction/{txnId}
    @GetMapping("/transaction/{txnId}")
    public ResponseEntity<Payment> getPaymentByTransactionId(@PathVariable String txnId) {
        try {
            Payment payment = paymentService.findByTransactionId(txnId)
                    .orElseThrow(() -> new IllegalArgumentException("Payment not found with transactionId " + txnId));

            return new ResponseEntity<>(payment, HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header("Error", e.getMessage())
                    .build();
        }
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                .header("Error", "Sorry! We have an internal Error! Please check back later.")
                .build();
        }
    }

    // POST /payments/create
    @PostMapping("/create")
    public ResponseEntity<Payment> createPayment(@RequestBody Payment payment) {
        try {
            Payment saved = paymentService.save(payment);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }

    // PUT /payments/update/{id}
    @PutMapping("/update/{id}")
    public ResponseEntity<Payment> updatePayment(@PathVariable String id, @RequestBody Payment updated) {
        try {
            updated.setId(id);
            Payment saved = paymentService.save(updated);
            return new ResponseEntity<>(saved, HttpStatus.OK);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }

    // DELETE /payments/delete/{id}
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable String id) {
        try {
            paymentService.delete(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Sorry! We have an internal Error! Please check back later.")
                    .build();
        }
    }
}
