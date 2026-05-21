package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    List<UserRole> findByUser(User user);
}
