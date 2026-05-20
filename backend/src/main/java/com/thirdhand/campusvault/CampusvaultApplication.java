package com.thirdhand.campusvault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CampusvaultApplication {

	public static void main(String[] args) {
		SpringApplication.run(CampusvaultApplication.class, args);
	}

}
