package com.skillstorm.cloudlodge.configs;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.skillstorm.cloudlodge.models.User;
import com.skillstorm.cloudlodge.repositories.UserRepository;
import com.skillstorm.cloudlodge.utils.JwtUtils;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    @Value("${app.oauth2.redirectUri:http://localhost:5173/oauth/callback}")
    private String redirectUri;

    public OAuth2AuthenticationSuccessHandler(UserRepository userRepository, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unsupported authentication type");
            return;
        }

        OAuth2User oauthUser = oauthToken.getPrincipal();
        Map<String, Object> attributes = oauthUser.getAttributes();

        String email = (String) attributes.get("email");
        String fullName = (String) attributes.getOrDefault("name", "");
        String providerId = (String) attributes.getOrDefault("sub", oauthUser.getName());
        String provider = oauthToken.getAuthorizedClientRegistrationId();

        if (email == null || email.isBlank()) {
            sendRedirectWithError(response, "Email not available from provider");
            return;
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(fullName);
            newUser.setAuthProvider(provider);
            newUser.setProviderId(providerId);
            newUser.setRole(User.Role.GUEST);
            newUser.setPreferences(new User.Preferences());
            newUser.setBillingAddress(new User.Address());
            newUser.setSavedPaymentMethods(new ArrayList<>());
            return newUser;
        });

        if (user.getAuthProvider() == null) {
            user.setAuthProvider(provider);
        }
        if (user.getProviderId() == null) {
            user.setProviderId(providerId);
        }
        if (user.getRole() == null) {
            user.setRole(User.Role.GUEST);
        }

        User savedUser = userRepository.save(user);

        String token = jwtUtils.generateJwtToken(savedUser.getId(), savedUser.getRole().name());

        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", token)
                .build(true)
                .toUriString();

        response.sendRedirect(targetUrl);
    }

    private void sendRedirectWithError(HttpServletResponse response, String message) throws IOException {
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("error", URLEncoder.encode(message, StandardCharsets.UTF_8))
                .build(true)
                .toUriString();
        response.sendRedirect(targetUrl);
    }
}
