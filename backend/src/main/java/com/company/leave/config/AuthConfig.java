package com.company.leave.config;

import java.time.Duration;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.auth")
public class AuthConfig {

    private int maxFailedLoginAttempts = 5;
    private Duration lockDuration = Duration.ofMinutes(30);
    private String seedPassword = "ChangeMe123!";
}
