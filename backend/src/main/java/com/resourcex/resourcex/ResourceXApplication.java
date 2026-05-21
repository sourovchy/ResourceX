package com.resourcex.resourcex;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ResourceXApplication {

	public static void main(String[] args) {
		SpringApplication.run(ResourceXApplication.class, args);
	}

}
