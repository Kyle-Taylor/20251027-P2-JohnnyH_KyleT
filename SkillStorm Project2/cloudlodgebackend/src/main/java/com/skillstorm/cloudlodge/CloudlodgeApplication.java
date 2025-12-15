package com.skillstorm.cloudlodge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class CloudlodgeApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure()
			.filename(".env")
			.ignoreIfMalformed()
			.ignoreIfMissing()
			.load();
		dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
		SpringApplication.run(CloudlodgeApplication.class, args);
	}

}
