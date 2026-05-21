package com.thirdhand.campusvault.repository;

import com.thirdhand.campusvault.entity.User;
import com.thirdhand.campusvault.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    List<UserRole> findByUser(User user);
}
