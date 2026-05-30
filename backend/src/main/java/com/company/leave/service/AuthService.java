package com.company.leave.service;

import com.company.leave.config.AuthConfig;
import com.company.leave.dto.request.LoginRequest;
import com.company.leave.dto.request.LogoutRequest;
import com.company.leave.dto.request.RefreshTokenRequest;
import com.company.leave.dto.response.AccessTokenResponse;
import com.company.leave.dto.response.ActionResponse;
import com.company.leave.dto.response.AuthResponse;
import com.company.leave.dto.response.UserResponse;
import com.company.leave.config.JwtConfig;
import com.company.leave.entity.RefreshToken;
import com.company.leave.entity.User;
import com.company.leave.exception.AccountLockedException;
import com.company.leave.exception.AuthenticationFailedException;
import com.company.leave.exception.InvalidTokenException;
import com.company.leave.exception.ResourceNotFoundException;
import com.company.leave.mapper.UserMapper;
import com.company.leave.repository.RefreshTokenRepository;
import com.company.leave.repository.UserRepository;
import com.company.leave.security.AuthenticatedUser;
import com.company.leave.security.JwtTokenProvider;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;
    private final AuthConfig authConfig;
    private final JwtConfig jwtConfig;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email())
            .orElseThrow(() -> new AuthenticationFailedException("Invalid email or password."));

        if (isLocked(user)) {
            throw new AccountLockedException("Your account is temporarily locked. Please try again later.");
        }

        try {
            AuthenticatedUser principal = (AuthenticatedUser) authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
            ).getPrincipal();

            user = userRepository.findByEmailIgnoreCase(principal.getUsername())
                .orElseThrow(() -> new AuthenticationFailedException("Invalid email or password."));

            resetFailedLogins(user);
            revokeActiveRefreshTokens(user.getId());

            String accessToken = jwtTokenProvider.generateAccessToken(principal);
            String refreshTokenValue = jwtTokenProvider.generateRefreshToken(principal);
            persistRefreshToken(user, refreshTokenValue);

            return new AuthResponse(accessToken, refreshTokenValue, userMapper.toAuthResponse(user));
        } catch (LockedException exception) {
            throw new AccountLockedException("Your account is temporarily locked. Please try again later.");
        } catch (DisabledException exception) {
            throw new AuthenticationFailedException("This account is inactive.");
        } catch (BadCredentialsException exception) {
            registerFailedLogin(user);
            throw new AuthenticationFailedException("Invalid email or password.");
        } catch (AuthenticationException exception) {
            throw new AuthenticationFailedException("Authentication failed.");
        }
    }

    @Transactional
    public AccessTokenResponse refresh(RefreshTokenRequest request) {
        refreshTokenRepository.deleteAllByExpiryDateBefore(LocalDateTime.now());

        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.refreshToken())
            .orElseThrow(() -> new InvalidTokenException("Refresh token is invalid or revoked."));

        if (Boolean.TRUE.equals(refreshToken.getRevoked()) || refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshToken.setRevoked(true);
            throw new InvalidTokenException("Refresh token is invalid or revoked.");
        }

        AuthenticatedUser principal = (AuthenticatedUser) userDetailsService.loadUserByUsername(refreshToken.getUser().getEmail());
        if (!principal.isAccountNonLocked()) {
            throw new AccountLockedException("Your account is temporarily locked. Please try again later.");
        }
        if (!principal.isEnabled()) {
            throw new AuthenticationFailedException("This account is inactive.");
        }

        if (!jwtTokenProvider.isRefreshTokenValid(request.refreshToken(), principal)) {
            throw new InvalidTokenException("Refresh token is invalid or expired.");
        }

        return new AccessTokenResponse(jwtTokenProvider.generateAccessToken(principal));
    }

    @Transactional
    public ActionResponse logout(LogoutRequest request) {
        refreshTokenRepository.findByToken(request.refreshToken()).ifPresent(token -> token.setRevoked(true));
        return new ActionResponse("Logged out successfully.");
    }

    @Transactional(readOnly = true)
    public UserResponse me(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        return userMapper.toResponse(user);
    }

    private boolean isLocked(User user) {
        return user.getAccountLockedUntil() != null && user.getAccountLockedUntil().isAfter(LocalDateTime.now());
    }

    private void resetFailedLogins(User user) {
        user.setFailedLoginAttempts(0);
        user.setAccountLockedUntil(null);
        userRepository.save(user);
    }

    private void registerFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts();
        attempts++;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= authConfig.getMaxFailedLoginAttempts()) {
            user.setAccountLockedUntil(LocalDateTime.now().plus(authConfig.getLockDuration()));
        }
        userRepository.save(user);
    }

    private void revokeActiveRefreshTokens(Long userId) {
        List<RefreshToken> activeTokens = refreshTokenRepository.findAllByUserIdAndRevokedFalse(userId);
        activeTokens.forEach(token -> token.setRevoked(true));
    }

    private void persistRefreshToken(User user, String tokenValue) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(tokenValue);
        refreshToken.setExpiryDate(LocalDateTime.now().plus(jwtConfig.getRefreshTokenExpiration()));
        refreshToken.setRevoked(false);
        refreshTokenRepository.save(refreshToken);
    }
}
