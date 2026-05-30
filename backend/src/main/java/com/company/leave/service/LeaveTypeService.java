package com.company.leave.service;

import com.company.leave.dto.request.CreateLeaveTypeDto;
import com.company.leave.dto.response.LeaveTypeResponse;
import com.company.leave.entity.LeaveType;
import com.company.leave.exception.ResourceNotFoundException;
import com.company.leave.mapper.LeaveTypeMapper;
import com.company.leave.repository.LeaveTypeRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LeaveTypeService {

    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveTypeMapper leaveTypeMapper;

    @Transactional
    public List<LeaveTypeResponse> listActive() {
        return leaveTypeRepository.findAllByActiveTrueOrderByNameAsc().stream().map(leaveTypeMapper::toResponse).toList();
    }

    @Transactional
    public LeaveTypeResponse create(CreateLeaveTypeDto request) {
        LeaveType leaveType = new LeaveType();
        apply(request, leaveType);
        return leaveTypeMapper.toResponse(leaveTypeRepository.save(leaveType));
    }

    @Transactional
    public LeaveTypeResponse update(Long id, CreateLeaveTypeDto request) {
        LeaveType leaveType = getEntity(id);
        apply(request, leaveType);
        return leaveTypeMapper.toResponse(leaveType);
    }

    @Transactional
    public void deactivate(Long id) {
        LeaveType leaveType = getEntity(id);
        leaveType.setActive(false);
    }

    @Transactional
    public LeaveType getActiveEntity(Long id) {
        LeaveType leaveType = getEntity(id);
        if (!Boolean.TRUE.equals(leaveType.getActive())) {
            throw new ResourceNotFoundException("Leave type is inactive.");
        }
        return leaveType;
    }

    private LeaveType getEntity(Long id) {
        return leaveTypeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Leave type not found."));
    }

    private void apply(CreateLeaveTypeDto request, LeaveType leaveType) {
        leaveType.setName(request.name());
        leaveType.setDescription(request.description());
        leaveType.setColorHex(request.colorHex());
        leaveType.setMaxDaysPerYear(request.maxDaysPerYear());
        leaveType.setRequiresDocument(Boolean.TRUE.equals(request.requiresDocument()));
        leaveType.setPaid(request.paid() == null || request.paid());
        leaveType.setActive(request.active() == null || request.active());
    }
}
