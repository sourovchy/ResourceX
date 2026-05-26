package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.University;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UniversityRepository extends JpaRepository<University, Long> {

    Optional<University> findByDomain(String domain);

    Boolean existsByDomain(String domain);

    Optional<University> findByName(String name);

    Boolean existsByName(String name);

    List<University> findAllByOrderByNameAsc();

    Optional<University> findByDomainIgnoreCase(String domain);

    Boolean existsByDomainIgnoreCase(String domain);

    Optional<University> findByNameIgnoreCase(String name);

    Boolean existsByNameIgnoreCase(String name);
}