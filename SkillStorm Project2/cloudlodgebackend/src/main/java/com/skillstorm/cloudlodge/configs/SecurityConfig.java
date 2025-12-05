package com.skillstorm.cloudlodge.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()   // ← allow ALL traffic
            )
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable());  // optional

        return http.build();
    }

            /**
            .sessionManagement(sess -> 
                sess.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/", 
                    "/index.html",
                    "/css/**", "/js/**", "/images/**",
                    "/auth/**",
                    "/users/register",
                    "/users/login"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable());

        return http.build();
    }
         */

    
}


//OAUTH CONFIG TO BE ADDED LATER
//MORE MATCHERS TO BE ADDED LATER
//ROLE BASED AUTHORIZATION ON MATCHERS TO BE ADDED LATER