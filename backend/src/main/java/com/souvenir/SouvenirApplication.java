package com.souvenir;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SouvenirApplication {
    public static void main(String[] args) {
        SpringApplication.run(SouvenirApplication.class, args);
    }
}
