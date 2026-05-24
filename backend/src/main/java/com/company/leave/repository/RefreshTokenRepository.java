package com.company.leave.repository;

import com.company.leave.entity.RefreshToken;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> findAllByUserIdAndRevokedFalse(Long userId);
    long deleteByUserIdAndRevokedTrue(Long userId);
    void deleteAllByExpiryDateBefore(LocalDateTime cutoff);
}
