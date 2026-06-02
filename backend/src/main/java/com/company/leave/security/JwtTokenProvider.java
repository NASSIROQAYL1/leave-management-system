package com.company.leave.security;

import com.company.leave.config.JwtConfig;
import com.company.leave.exception.InvalidTokenException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtConfig jwtConfig;

    public String generateAccessToken(UserDetails userDetails) {
        return generateToken(
            userDetails.getUsername(),
            jwtConfig.getAccessTokenExpiration(),
            Map.of(
                "type", jwtConfig.getAccessTokenType(),
                "scope", userDetails.getAuthorities()
            )
        );
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return generateToken(
            userDetails.getUsername(),
            jwtConfig.getRefreshTokenExpiration(),
            Map.of("type", jwtConfig.getRefreshTokenType())
        );
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isAccessTokenValid(String token, UserDetails userDetails) {
        return isTokenValid(token, userDetails, jwtConfig.getAccessTokenType());
    }

    public boolean isRefreshTokenValid(String token, UserDetails userDetails) {
        return isTokenValid(token, userDetails, jwtConfig.getRefreshTokenType());
    }

    public String extractTokenType(String token) {
        return extractAllClaims(token).get("type", String.class);
    }

    private String generateToken(String subject, java.time.Duration duration, Map<String, Object> claims) {
        Instant now = Instant.now();
        Instant expiration = now.plus(duration);
        return Jwts.builder()
            .claims(claims)
            .subject(subject)
            .issuer(jwtConfig.getIssuer())
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiration))
            .signWith(getSigningKey())
            .compact();
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                .verifyWith(getSigningKey())
                .requireIssuer(jwtConfig.getIssuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        } catch (JwtException | IllegalArgumentException exception) {
            throw new InvalidTokenException("Invalid or expired token.");
        }
    }

    private boolean isTokenValid(String token, UserDetails userDetails, String tokenType) {
        Claims claims = extractAllClaims(token);
        return claims.getSubject().equalsIgnoreCase(userDetails.getUsername())
            && tokenType.equals(claims.get("type", String.class))
            && !claims.getExpiration().before(new Date());
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtConfig.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
