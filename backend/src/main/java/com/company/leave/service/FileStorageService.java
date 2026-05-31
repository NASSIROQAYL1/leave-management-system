package com.company.leave.service;

import com.company.leave.dto.response.FileUploadResponse;
import com.company.leave.exception.UnauthorizedActionException;
import com.company.leave.exception.ResourceNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final Map<String, String> ALLOWED_CONTENT_TYPES = Map.of(
        "application/pdf", ".pdf",
        "image/jpeg", ".jpg",
        "image/png", ".png"
    );

    private final Path uploadPath;
    private final long maxFileSizeBytes;

    public FileStorageService(
        @Value("${app.file-storage.upload-dir:uploads}") String uploadDir,
        @Value("${app.file-storage.max-file-size:5MB}") org.springframework.util.unit.DataSize maxFileSize
    ) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.maxFileSizeBytes = maxFileSize.toBytes();
        try {
            Files.createDirectories(this.uploadPath);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not initialize upload directory.", exception);
        }
    }

    public FileUploadResponse store(Long userId, MultipartFile file) {
        validate(file);
        try {
            String extension = ALLOWED_CONTENT_TYPES.get(file.getContentType());
            String filename = UUID.randomUUID() + extension;
            Path userDirectory = uploadPath.resolve(String.valueOf(userId)).normalize();
            Files.createDirectories(userDirectory);
            Path target = userDirectory.resolve(filename);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return new FileUploadResponse(filename, "/api/files/" + userId + "/" + filename);
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to store file.", exception);
        }
    }

    public Resource loadAsResource(Long userId, String filename) {
        try {
            Path file = uploadPath.resolve(String.valueOf(userId)).resolve(filename).normalize();
            if (!file.startsWith(uploadPath)) {
                throw new UnauthorizedActionException("Invalid file path.");
            }
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists()) {
                throw new ResourceNotFoundException("File not found.");
            }
            return resource;
        } catch (IOException exception) {
            throw new ResourceNotFoundException("File not found.");
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required.");
        }
        if (file.getSize() > maxFileSizeBytes) {
            throw new IllegalArgumentException("File exceeds the 5MB limit.");
        }
        if (!ALLOWED_CONTENT_TYPES.containsKey(file.getContentType())) {
            throw new IllegalArgumentException("Only PDF, JPEG, and PNG files are allowed.");
        }
    }
}
