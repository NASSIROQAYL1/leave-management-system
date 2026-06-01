//HAD CODE MAS2OL BAX UPLOD XI MILAF BHAL XAHADA MARADIYA

package com.company.leave.controller;

import com.company.leave.dto.response.FileUploadResponse;
import com.company.leave.entity.enums.Role;
import com.company.leave.exception.UnauthorizedActionException;
import com.company.leave.service.FileStorageService;
import com.company.leave.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public FileUploadResponse upload(
        @org.springframework.security.core.annotation.AuthenticationPrincipal AuthenticatedUser principal,
        @RequestParam("file") MultipartFile file
    ) {
        return fileStorageService.store(principal.getId(), file);
    }

    @GetMapping("/{userId}/{filename:.+}")
    public ResponseEntity<Resource> download(
        @org.springframework.security.core.annotation.AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long userId,
        @PathVariable String filename
    ) {
        boolean privileged = principal.getRole() == Role.ADMIN || principal.getRole() == Role.MANAGER;
        if (!privileged && !principal.getId().equals(userId)) {
            throw new UnauthorizedActionException("You are not allowed to access this file.");
        }
        Resource resource = fileStorageService.loadAsResource(userId, filename);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(resource);
    }
}
