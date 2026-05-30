package com.company.leave.exception;

import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    ProblemDetail handleNotFound(ResourceNotFoundException exception) {
        return problem(HttpStatus.NOT_FOUND, "Resource not found", exception.getMessage());
    }

    @ExceptionHandler({InsufficientLeaveBalanceException.class, LeaveOverlapException.class, IllegalArgumentException.class})
    ProblemDetail handleBadRequest(RuntimeException exception) {
        return problem(HttpStatus.BAD_REQUEST, "Invalid request", exception.getMessage());
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    ProblemDetail handleMissingParam(MissingServletRequestParameterException exception) {
        return problem(HttpStatus.BAD_REQUEST, "Missing parameter", exception.getMessage());
    }

    @ExceptionHandler({
        AuthenticationFailedException.class,
        AuthenticationException.class,
        BadCredentialsException.class,
        DisabledException.class,
        UsernameNotFoundException.class,
        InvalidTokenException.class
    })
    ProblemDetail handleUnauthorized(RuntimeException exception) {
        return problem(HttpStatus.UNAUTHORIZED, "Authentication failed", exception.getMessage());
    }

    @ExceptionHandler({AccountLockedException.class, LockedException.class})
    ProblemDetail handleLocked(RuntimeException exception) {
        return problem(HttpStatus.LOCKED, "Account locked", exception.getMessage());
    }

    @ExceptionHandler(UnauthorizedActionException.class)
    ProblemDetail handleForbidden(UnauthorizedActionException exception) {
        return problem(HttpStatus.FORBIDDEN, "Forbidden", exception.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    ProblemDetail handleSpringForbidden(AccessDeniedException exception) {
        return problem(HttpStatus.FORBIDDEN, "Access denied", exception.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail handleValidation(MethodArgumentNotValidException exception) {
        ProblemDetail problemDetail = problem(HttpStatus.BAD_REQUEST, "Validation failed", "One or more fields are invalid.");
        problemDetail.setProperty(
            "errors",
            exception.getBindingResult().getFieldErrors().stream()
                .map(this::formatFieldError)
                .toList()
        );
        return problemDetail;
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail handleUnexpected(Exception exception) {
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error", exception.getMessage());
    }

    private ProblemDetail problem(HttpStatus status, String title, String detail) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, detail);
        problemDetail.setTitle(title);
        problemDetail.setType(URI.create("https://company.com/problems/" + status.value()));
        return problemDetail;
    }

    private String formatFieldError(FieldError error) {
        return error.getField() + ": " + error.getDefaultMessage();
    }
}
