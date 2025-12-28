package com.skillstorm.cloudlodge.services;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.skillstorm.cloudlodge.models.Payment;
import com.skillstorm.cloudlodge.models.PaymentIntentRequest;
import com.skillstorm.cloudlodge.models.Reservation;
import com.skillstorm.cloudlodge.models.User;
import com.skillstorm.cloudlodge.repositories.UserRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentMethod;
import com.stripe.model.StripeObject;
import com.stripe.model.SetupIntent;
import com.stripe.net.Webhook;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentMethodAttachParams;
import com.stripe.param.PaymentMethodListParams;
import com.stripe.param.PaymentMethodDetachParams;
import com.stripe.param.SetupIntentCreateParams;
import com.stripe.param.PaymentMethodListParams;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class StripePaymentService {

    private static final Logger log = LoggerFactory.getLogger(StripePaymentService.class);

    private final UserRepository userRepository;
    private final ReservationService reservationService;
    private final PaymentService paymentService;

    @Value("${stripe.publishable.key}")
    private String publishableKey;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    public StripePaymentService(UserRepository userRepository,
                                ReservationService reservationService,
                                PaymentService paymentService) {
        this.userRepository = userRepository;
        this.reservationService = reservationService;
        this.paymentService = paymentService;
    }

    public Map<String, String> getConfig() {
        Map<String, String> resp = new HashMap<>();
        resp.put("publishableKey", publishableKey);
        return resp;
    }

    public Map<String, String> createSetupIntent(User user) throws StripeException {
        String customerId = ensureCustomer(user);
        SetupIntentCreateParams params = SetupIntentCreateParams.builder()
                .setCustomer(customerId)
                .addPaymentMethodType("card")
                .build();
        SetupIntent setupIntent = SetupIntent.create(params);
        Map<String, String> resp = new HashMap<>();
        resp.put("clientSecret", setupIntent.getClientSecret());
        resp.put("setupIntentId", setupIntent.getId());
        return resp;
    }

    public Map<String, String> createPaymentIntent(PaymentIntentRequest request, User user) throws StripeException {
        if (request.getReservationId() == null || request.getReservationId().isBlank()) {
            throw new IllegalArgumentException("reservationId is required");
        }

        Reservation reservation = reservationService.findById(request.getReservationId())
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        // Basic check to ensure the requester is the owner (best-effort)
        if (reservation.getUserId() != null && user != null && !reservation.getUserId().equals(user.getId())) {
            throw new IllegalArgumentException("Reservation does not belong to current user");
        }

        double totalPrice = Optional.ofNullable(reservation.getTotalPrice())
                .orElseThrow(() -> new IllegalArgumentException("Reservation missing total price"));

        long amountCents = Math.round(totalPrice * 100);
        if (amountCents <= 0) {
            throw new IllegalArgumentException("Invalid amount for reservation");
        }

        String customerId = ensureCustomer(user);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency("usd")
                .addPaymentMethodType("card")
                .setCustomer(customerId)
                .setReceiptEmail(user.getEmail())
                .putMetadata("reservationId", reservation.getId())
                .putMetadata("userId", user.getId())
                .putMetadata("savePaymentMethod", Boolean.toString(request.isSavePaymentMethod()))
                .setSetupFutureUsage(request.isSavePaymentMethod()
                        ? PaymentIntentCreateParams.SetupFutureUsage.OFF_SESSION
                        : null)
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        Payment payment = new Payment();
        payment.setReservationId(reservation.getId());
        payment.setTransactionId(intent.getId());
        payment.setAmount(totalPrice);
        payment.setCurrency("usd");
        payment.setStatus(Payment.Status.PENDING);
        paymentService.save(payment);

        reservation.setStatus(Reservation.Status.PENDING_PAYMENT);
        reservationService.save(reservation);

        Map<String, String> resp = new HashMap<>();
        resp.put("clientSecret", intent.getClientSecret());
        resp.put("paymentIntentId", intent.getId());
        return resp;
    }

    public String handleWebhook(String payload, String sigHeader, HttpServletRequest request) throws StripeException {
        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            throw new RuntimeException("Invalid webhook signature");
        }

        String type = event.getType();
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = dataObjectDeserializer.getObject().orElse(null);

        if (stripeObject == null) {
            return "";
        }

        switch (type) {
            case "payment_intent.succeeded" -> handlePaymentIntentSucceeded((PaymentIntent) stripeObject);
            case "payment_intent.payment_failed" -> handlePaymentIntentFailed((PaymentIntent) stripeObject);
            case "payment_method.attached" -> handlePaymentMethodAttached((PaymentMethod) stripeObject);
            default -> {
                // ignore unhandled events
            }
        }

        return "";
    }

    private void handlePaymentIntentSucceeded(PaymentIntent intent) {
        log.info("payment_intent.succeeded id={}, pm={}, metadata={}", intent.getId(), intent.getPaymentMethod(), intent.getMetadata());
        System.out.println("payment_intent.succeeded " + intent.getId() + " pm=" + intent.getPaymentMethod() + " meta=" + intent.getMetadata());
        Payment payment = paymentService.findByTransactionId(intent.getId()).orElse(new Payment());
        payment.setTransactionId(intent.getId());
        payment.setAmount(intent.getAmount() != null ? intent.getAmount() / 100.0 : payment.getAmount());
        payment.setCurrency(intent.getCurrency());
        payment.setStatus(Payment.Status.SUCCEEDED);

        if (intent.getMetadata() != null) {
            String reservationId = intent.getMetadata().get("reservationId");
            payment.setReservationId(reservationId);
            Payment savedPayment = paymentService.save(payment);
            reservationService.findById(reservationId).ifPresent(reservation -> {
                reservation.setStatus(Reservation.Status.CONFIRMED);
                if (savedPayment.getId() != null) {
                    reservation.setPaymentId(savedPayment.getId());
                }
                reservationService.save(reservation);
            });

            boolean savePaymentMethod = Boolean.parseBoolean(intent.getMetadata().getOrDefault("savePaymentMethod", "false"));
            if (!savePaymentMethod) {
                log.info("Not saving payment method for intent {} (flag false)", intent.getId());
                System.out.println("Not saving payment method for intent " + intent.getId() + " flag false");
            }
            if (savePaymentMethod && intent.getPaymentMethod() != null) {
                String userIdFromMeta = intent.getMetadata().get("userId");
                if (userIdFromMeta != null) {
                    userRepository.findById(userIdFromMeta).ifPresent(user -> savePaymentMethodForUser(intent, user));
                }

                reservationService.findById(reservationId).ifPresent(reservation -> {
                    userRepository.findById(reservation.getUserId()).ifPresent(user -> {
                        savePaymentMethodForUser(intent, user);
                    });
                });
            } else if (savePaymentMethod && intent.getPaymentMethod() == null) {
                log.warn("Intent {} requested savePaymentMethod but paymentMethod is null", intent.getId());
                System.out.println("savePaymentMethod true but pm null for intent " + intent.getId());
            }
        }

        if (payment.getId() == null) {
            paymentService.save(payment);
        }
    }

    private void handlePaymentIntentFailed(PaymentIntent intent) {
        Payment payment = paymentService.findByTransactionId(intent.getId()).orElse(new Payment());
        payment.setTransactionId(intent.getId());
        payment.setAmount(intent.getAmount() != null ? intent.getAmount() / 100.0 : payment.getAmount());
        payment.setCurrency(intent.getCurrency());
        payment.setStatus(Payment.Status.FAILED);

        if (intent.getMetadata() != null) {
            String reservationId = intent.getMetadata().get("reservationId");
            payment.setReservationId(reservationId);
            reservationService.findById(reservationId).ifPresent(reservation -> {
                reservation.setStatus(Reservation.Status.PENDING_PAYMENT);
                reservationService.save(reservation);
            });
        }

        paymentService.save(payment);
    }

    private String ensureCustomer(User user) throws StripeException {
        if (user.getStripeCustomerId() != null && !user.getStripeCustomerId().isBlank()) {
            return user.getStripeCustomerId();
        }

        CustomerCreateParams params = CustomerCreateParams.builder()
                .setEmail(user.getEmail())
                .setName(user.getFullName())
                .build();

        Customer customer = Customer.create(params);
        user.setStripeCustomerId(customer.getId());
        userRepository.save(user);
        return customer.getId();
    }

    public java.util.List<User.SavedPaymentMethod> syncPaymentMethods(User user) throws StripeException {
        String customerId = ensureCustomer(user);
        PaymentMethodListParams params = PaymentMethodListParams.builder()
                .setCustomer(customerId)
                .setType(PaymentMethodListParams.Type.CARD)
                .build();
        java.util.List<User.SavedPaymentMethod> methods = new java.util.ArrayList<>();
        for (PaymentMethod pm : PaymentMethod.list(params).getData()) {
            if (pm.getCard() == null) continue;
            User.SavedPaymentMethod saved = new User.SavedPaymentMethod();
            saved.setStripePaymentMethodId(pm.getId());
            saved.setBrand(pm.getCard().getBrand());
            saved.setLast4(pm.getCard().getLast4());
            methods.add(saved);
        }
        user.setSavedPaymentMethods(methods);
        userRepository.save(user);
        log.info("Synced {} payment methods for user {}", methods.size(), user.getId());
        return methods;
    }

    public void removePaymentMethod(User user, String paymentMethodId) throws StripeException {
        ensureCustomer(user);

        // Detach from Stripe customer
        PaymentMethod pm = PaymentMethod.retrieve(paymentMethodId);
        if (pm != null) {
            pm.detach(PaymentMethodDetachParams.builder().build());
        }

        if (user.getSavedPaymentMethods() != null) {
            user.getSavedPaymentMethods().removeIf(pmSaved -> paymentMethodId.equals(pmSaved.getStripePaymentMethodId()));
            userRepository.save(user);
        }
    }

    private void savePaymentMethodForUser(PaymentIntent intent, User user) {
        try {
            ensureCustomer(user);
            attachAndStorePaymentMethod(intent.getPaymentMethod(), user);
            log.info("Stored payment method {} for user {}", intent.getPaymentMethod(), user.getId());
            System.out.println("Stored payment method " + intent.getPaymentMethod() + " for user " + user.getId());
        } catch (StripeException e) {
            log.warn("Failed to store payment method {} for user {}", intent.getPaymentMethod(), user.getId(), e);
            System.out.println("Failed to store payment method " + intent.getPaymentMethod() + " for user " + user.getId() + " error " + e.getMessage());
        }
    }

    private void handlePaymentMethodAttached(PaymentMethod pm) {
        log.info("payment_method.attached id={}, customer={}", pm.getId(), pm.getCustomer());
        System.out.println("payment_method.attached " + pm.getId() + " customer=" + pm.getCustomer());
        if (pm.getCustomer() == null || pm.getCustomer().isEmpty()) {
            return;
        }
        userRepository.findByStripeCustomerId(pm.getCustomer()).ifPresent(user -> {
            try {
                attachAndStorePaymentMethod(pm.getId(), user);
                log.info("Stored attached payment method {} for user {}", pm.getId(), user.getId());
                System.out.println("Stored attached payment method " + pm.getId() + " for user " + user.getId());
            } catch (StripeException e) {
                log.warn("Failed to store attached payment method {} for user {}", pm.getId(), user.getId(), e);
                System.out.println("Failed to store attached payment method " + pm.getId() + " for user " + user.getId() + " error " + e.getMessage());
            }
        });
    }

    private void attachAndStorePaymentMethod(String paymentMethodId, User user) throws StripeException {
        PaymentMethod pm = PaymentMethod.retrieve(paymentMethodId);
        if (pm.getCustomer() == null || pm.getCustomer().isEmpty()) {
            PaymentMethodAttachParams attachParams = PaymentMethodAttachParams.builder()
                    .setCustomer(user.getStripeCustomerId())
                    .build();
            pm = pm.attach(attachParams);
        }

        if (user.getSavedPaymentMethods() == null) {
            user.setSavedPaymentMethods(new java.util.ArrayList<>());
        }

        boolean exists = user.getSavedPaymentMethods().stream()
                .anyMatch(saved -> paymentMethodId.equals(saved.getStripePaymentMethodId()));
        if (!exists && pm.getCard() != null) {
            User.SavedPaymentMethod saved = new User.SavedPaymentMethod();
            saved.setStripePaymentMethodId(paymentMethodId);
            saved.setBrand(pm.getCard().getBrand());
            saved.setLast4(pm.getCard().getLast4());
            user.getSavedPaymentMethods().add(saved);
            userRepository.save(user);
        } else if (exists) {
            log.info("Payment method {} already stored for user {}", paymentMethodId, user.getId());
        } else {
            log.warn("Payment method {} has no card details; not storing for user {}", paymentMethodId, user.getId());
        }
    }
}
