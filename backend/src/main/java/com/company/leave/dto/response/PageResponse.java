package com.company.leave.dto.response;

import java.util.List;
import org.springframework.data.domain.Page;

public record PageResponse<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean first,
    boolean last,
    String sortBy,
    String sortDirection
) {
    public static <T> PageResponse<T> from(Page<T> page, String sortBy, String sortDirection) {
        return new PageResponse<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast(),
            sortBy,
            sortDirection
        );
    }
}
