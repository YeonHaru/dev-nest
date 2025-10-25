package com.developersnest.devnestbackend;

import com.developersnest.devnestbackend.auth.config.AuthProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AuthProperties.class)
public class DevNestBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(DevNestBackendApplication.class, args);
    }

}
