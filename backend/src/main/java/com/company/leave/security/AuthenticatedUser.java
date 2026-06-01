package com.company.leave.security;

import com.company.leave.entity.enums.Role;
import java.time.LocalDateTime;
import java.util.Collection;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

@Getter
public class AuthenticatedUser extends User {

    private final Long id;
    private final String firstName;
    private final String lastName;
    private final Role role;
    private final Boolean active;
    private final LocalDateTime accountLockedUntil;

    public AuthenticatedUser(
        Long id,
        String username,
        String password,
        String firstName,
        String lastName,
        Role role,
        Boolean active,
        LocalDateTime accountLockedUntil,
        boolean accountNonLocked,
        Collection<? extends GrantedAuthority> authorities
    ) {
        super(username, password, true, true, true, accountNonLocked, authorities);
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.active = active;
        this.accountLockedUntil = accountLockedUntil;
    }
}
