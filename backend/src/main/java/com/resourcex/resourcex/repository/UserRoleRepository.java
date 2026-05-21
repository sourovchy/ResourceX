package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Role;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    List<UserRole> findAllByUser(User user);

    List<UserRole> findAllByUser_UserId(Long userId);

    List<UserRole> findAllByRole(Role role);

    List<UserRole> findAllByRole_NameIgnoreCase(String roleName);

    Optional<UserRole> findByUserAndRole(User user, Role role);

    boolean existsByUserAndRole(User user, Role role);

    void deleteAllByUser(User user);

    void deleteAllByRole(Role role);
}