package com.company.leave.service;

import com.company.leave.dto.request.CreatePublicHolidayDto;
import com.company.leave.dto.response.PublicHolidayResponse;
import com.company.leave.entity.PublicHoliday;
import com.company.leave.exception.ResourceNotFoundException;
import com.company.leave.mapper.PublicHolidayMapper;
import com.company.leave.repository.PublicHolidayRepository;
import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicHolidayService {

    private final PublicHolidayRepository publicHolidayRepository;
    private final PublicHolidayMapper publicHolidayMapper;

    @Transactional(readOnly = true)
    public Set<LocalDate> getHolidayDatesBetween(LocalDate startDate, LocalDate endDate) {
        return publicHolidayRepository.findAllByDateBetween(startDate, endDate).stream()
            .map(PublicHoliday::getDate)
            .collect(Collectors.toSet());
    }

    @Transactional(readOnly = true)
    public java.util.List<PublicHolidayResponse> getByYear(Integer year) {
        return publicHolidayRepository.findAllByYearOrderByDateAsc(year).stream()
            .map(publicHolidayMapper::toResponse)
            .toList();
    }

    @Transactional
    public PublicHolidayResponse create(CreatePublicHolidayDto request) {
        PublicHoliday publicHoliday = new PublicHoliday();
        publicHoliday.setName(request.name());
        publicHoliday.setDate(request.date());
        publicHoliday.setYear(request.year() != null ? request.year() : request.date().getYear());
        publicHoliday.setRecurring(Boolean.TRUE.equals(request.recurring()));
        return publicHolidayMapper.toResponse(publicHolidayRepository.save(publicHoliday));
    }

    @Transactional
    public void delete(Long id) {
        PublicHoliday publicHoliday = publicHolidayRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Public holiday not found."));
        publicHolidayRepository.delete(publicHoliday);
    }
}
