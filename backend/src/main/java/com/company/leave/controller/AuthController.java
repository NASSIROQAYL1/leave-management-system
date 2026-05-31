//HADA MAS2OL 3LA LOGIN O LOGOUT O FORGET PASSWORD

package com.company.leave.controller;

import com.company.leave.dto.request.ForgotPasswordRequest;
import com.company.leave.dto.request.LoginRequest;
import com.company.leave.dto.request.LogoutRequest;
import com.company.leave.dto.request.RefreshTokenRequest;
import com.company.leave.dto.request.ResetPasswordRequest;
import com.company.leave.dto.response.AccessTokenResponse;
import com.company.leave.dto.response.ActionResponse;
import com.company.leave.dto.response.AuthResponse;
import com.company.leave.dto.response.UserResponse;
import com.company.leave.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AccessTokenResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request);
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ActionResponse logout(@Valid @RequestBody LogoutRequest request) {
        return authService.logout(request);
    }

    @PostMapping("/forgot-password")
    public ActionResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "Forgot password deferred.");
    }

    @PostMapping("/reset-password")
    public ActionResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "Reset password deferred.");
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UserResponse me(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        return authService.me(principal.getUsername());
    }
}
