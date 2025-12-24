package com.skillstorm.cloudlodge.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.cloudlodge.models.Payment;
import com.skillstorm.cloudlodge.models.PaymentIntentRequest;
import com.skillstorm.cloudlodge.models.User;
import com.skillstorm.cloudlodge.services.PaymentService;
import com.skillstorm.cloudlodge.services.StripePaymentService;
import com.stripe.exception.StripeException;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final StripePaymentService stripePaymentService;

    public PaymentController(PaymentService paymentService, StripePaymentService stripePaymentService) {
        this.paymentService = paymentService;
        this.stripePaymentService = stripePaymentService;
    }

    // Public config endpoint for publishable key
    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        return ResponseEntity.ok(stripePaymentService.getConfig());
    }

    // Create PaymentIntent for a reservation
    @PostMapping("/intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody PaymentIntentRequest request, Authentication authentication) {
        try {
            if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
            }
            User user = (User) authentication.getPrincipal();
            return ResponseEntity.ok(stripePaymentService.createPaymentIntent(request, user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (StripeException e) {
            return ResponseEntity.internalServerError().body("Stripe error: " + e.getMessage());
        }
    }

    // Stripe webhook (no auth, signature verified)
    @PostMapping("/webhook")
    @ResponseBody
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload,
                                                      @RequestHeader("Stripe-Signature") String sigHeader,
                                                      HttpServletRequest request) {
        try {
            stripePaymentService.handleWebhook(payload, sigHeader, request);
            return ResponseEntity.ok("");
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook error");
        }
    }

    // Manually sync Stripe payment methods to user profile (fallback)
    @PostMapping("/methods/sync")
    public ResponseEntity<?> syncPaymentMethods(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        try {
            return ResponseEntity.ok(stripePaymentService.syncPaymentMethods(user));
        } catch (StripeException e) {
            return ResponseEntity.internalServerError().body("Stripe error: " + e.getMessage());
        }
    }

    @DeleteMapping("/methods/{paymentMethodId}")
    public ResponseEntity<?> deletePaymentMethod(@PathVariable String paymentMethodId, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        try {
            stripePaymentService.removePaymentMethod(user, paymentMethodId);
            return ResponseEntity.noContent().build();
        } catch (StripeException e) {
            return ResponseEntity.internalServerError().body("Stripe error: " + e.getMessage());
        }
    }

    @PostMapping("/setup-intent")
    public ResponseEntity<?> createSetupIntent(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        try {
            return ResponseEntity.ok(stripePaymentService.createSetupIntent(user));
        } catch (StripeException e) {
            return ResponseEntity.internalServerError().body("Stripe error: " + e.getMessage());
        }
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
