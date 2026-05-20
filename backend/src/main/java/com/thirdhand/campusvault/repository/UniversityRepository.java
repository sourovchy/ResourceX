package com.thirdhand.campusvault.repository;

import com.thirdhand.campusvault.entity.University;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UniversityRepository extends JpaRepository<University, Long> {

    Optional<University> findByDomain(String domain);

    Boolean existsByDomain(String domain);

    Optional<University> findByName(String name);

    Boolean existsByName(String name);
}