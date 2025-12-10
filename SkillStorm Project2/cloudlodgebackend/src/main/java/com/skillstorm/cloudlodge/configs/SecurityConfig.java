package com.skillstorm.cloudlodge.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;



@Configuration
public class SecurityConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:5173");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/", 
                    "/index.html",
                    "/css/**", "/js/**", "/images/**",
                    "/auth/**",
                    "/users/register",
                    "/users/login",
                    "/oauth2/**",
                    "/dashboard",
                    "/rooms/**",
                    "/roomtypes/**",
                    "/availabilities/**",
                    "/reservations/**",
                    "/payments/**"
                ).permitAll()
                .anyRequest().authenticated()   // ← allow ALL traffic
            )
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())  // optional
            .oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl("/dashboard") // where you want the user after login
                .failureUrl("/login?error")      // optional
            );


        return http.build();
    }

}