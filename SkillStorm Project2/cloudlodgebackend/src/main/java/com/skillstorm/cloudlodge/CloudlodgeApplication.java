package com.skillstorm.cloudlodge;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.skillstorm.cloudlodge.utils.JwtUtils;

@SpringBootApplication
public class CloudlodgeApplication {

	public static void main(String[] args) {
		SpringApplication.run(CloudlodgeApplication.class, args);
	}

}
