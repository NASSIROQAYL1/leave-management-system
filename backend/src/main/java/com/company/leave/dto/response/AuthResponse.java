package com.company.leave.dto.response;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    AuthUserResponse user
) {
}
