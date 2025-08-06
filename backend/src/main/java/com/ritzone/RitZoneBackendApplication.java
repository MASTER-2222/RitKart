package com.ritzone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for RitZone Backend
 * 
 * @author RitZone Development Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableMongoAuditing
@EnableCaching
@EnableAsync
@EnableScheduling
public class RitZoneBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(RitZoneBackendApplication.class, args);
        System.out.println("🚀 RitZone Backend API is running!");
        System.out.println("📚 API Documentation: http://localhost:8080/api/swagger-ui.html");
        System.out.println("🔍 Health Check: http://localhost:8080/api/actuator/health");
    }
}
