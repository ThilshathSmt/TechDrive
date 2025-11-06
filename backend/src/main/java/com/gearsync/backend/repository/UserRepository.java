package com.gearsync.backend.repository;
import com.gearsync.backend.model.Role;
import com.gearsync.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPasswordResetToken(String resetToken);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    default List<User> findAllEmployees() {
        return findByRole(Role.EMPLOYEE);
    }
    List<User> findByRoleAndIsActiveTrue(Role role);
    default List<User> findActiveEmployees() {
        return findByRoleAndIsActiveTrue(Role.EMPLOYEE);
    }
}