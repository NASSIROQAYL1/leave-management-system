package com.company.leave.repository;

import com.company.leave.entity.User;
import com.company.leave.entity.enums.Role;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<User> findAllByDepartmentId(Long departmentId);
    List<User> findAllByManagerId(Long managerId);
    List<User> findAllByRole(Role role);
    Optional<User> findByIdAndActiveTrue(Long id);
    List<User> findAllByRoleIn(List<Role> roles);
    Page<User> findAllByActiveTrue(Pageable pageable);
    long countByActiveTrue();
}
