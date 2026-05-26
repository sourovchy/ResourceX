package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<Role> findAllByOrderByRoleIdAsc();

    long countByNameIgnoreCase(String name);
}