//HNA AYAM D CONGEE LI KAYNIN F SISTEM

package com.company.leave.controller;

import com.company.leave.dto.request.CreatePublicHolidayDto;
import com.company.leave.dto.response.PublicHolidayResponse;
import com.company.leave.service.PublicHolidayService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/public-holidays")
@RequiredArgsConstructor
public class PublicHolidayController {

    private final PublicHolidayService publicHolidayService;

    @GetMapping
    public List<PublicHolidayResponse> list(@RequestParam Integer year) {
        return publicHolidayService.getByYear(year);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public PublicHolidayResponse create(@Valid @RequestBody CreatePublicHolidayDto request) {
        return publicHolidayService.create(request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        publicHolidayService.delete(id);
    }
}
