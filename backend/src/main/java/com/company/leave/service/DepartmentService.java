package com.company.leave.service;

import com.company.leave.dto.request.CreateDepartmentDto;
import com.company.leave.dto.response.DepartmentResponse;
import com.company.leave.dto.response.PageResponse;
import com.company.leave.entity.Department;
import com.company.leave.entity.User;
import com.company.leave.exception.ResourceNotFoundException;
import com.company.leave.mapper.DepartmentMapper;
import com.company.leave.repository.DepartmentRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;
    private final UserService userService;

    @Transactional
    public DepartmentResponse create(CreateDepartmentDto request) {
        Department department = new Department();
        apply(request, department);
        return departmentMapper.toResponse(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentResponse update(Long id, CreateDepartmentDto request) {
        Department department = getEntity(id);
        apply(request, department);
        return departmentMapper.toResponse(department);
    }

    @Transactional
    public void delete(Long id) {
        Department department = getEntity(id);
        departmentRepository.delete(department);
    }

    @Transactional
    public List<DepartmentResponse> listAll() {
        return departmentRepository.findAll().stream().map(departmentMapper::toResponse).toList();
    }

    @Transactional
    public PageResponse<DepartmentResponse> listPaged(int page, int size) {
        return PageResponse.from(departmentRepository.findAll(PageRequest.of(page, size)).map(departmentMapper::toResponse), "name", "asc");
    }

    @Transactional
    public Department getEntity(Long id) {
        return departmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Department not found."));
    }

    private void apply(CreateDepartmentDto request, Department department) {
        department.setName(request.name());
        department.setDescription(request.description());
        User manager = request.managerId() != null ? userService.getActiveUserById(request.managerId()) : null;
        department.setManager(manager);
    }
}
