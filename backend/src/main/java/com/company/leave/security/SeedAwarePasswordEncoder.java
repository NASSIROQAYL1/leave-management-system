package com.company.leave.security;

import com.company.leave.config.AuthConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SeedAwarePasswordEncoder implements PasswordEncoder {

    private static final String SEED_PLACEHOLDER_PREFIX = "$2a$10$seedplaceholderbcryptvalueforphaseoneonly";

    private final AuthConfig authConfig;
    private final BCryptPasswordEncoder delegate = new BCryptPasswordEncoder();

    @Override
    public String encode(CharSequence rawPassword) {
        return delegate.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (encodedPassword != null
            && encodedPassword.startsWith(SEED_PLACEHOLDER_PREFIX)
            && authConfig.getSeedPassword() != null) {
            return authConfig.getSeedPassword().contentEquals(rawPassword);
        }
        return delegate.matches(rawPassword, encodedPassword);
    }
}
