package com.company.leave.security;

import com.company.leave.entity.User;
import com.company.leave.repository.UserRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCase(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        boolean accountNonLocked = user.getAccountLockedUntil() == null || user.getAccountLockedUntil().isBefore(LocalDateTime.now());

        return new AuthenticatedUser(
            user.getId(),
            user.getEmail(),
            user.getPassword(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole(),
            user.getActive(),
            user.getAccountLockedUntil(),
            accountNonLocked,
            java.util.List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
