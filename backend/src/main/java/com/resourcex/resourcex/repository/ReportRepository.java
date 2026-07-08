package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Report;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    // mapToResponse reads reporter's scalar fields, so join-fetch the lazy reporter
    // to avoid one extra SELECT per report row on these admin list endpoints.
    @EntityGraph(attributePaths = "reporter", type = EntityGraph.EntityGraphType.LOAD)
    List<Report> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = "reporter", type = EntityGraph.EntityGraphType.LOAD)
    List<Report> findByReporterUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByReporterUserIdAndEntityTypeAndEntityId(Long reporterId, Report.EntityType entityType, Long entityId);

    @EntityGraph(attributePaths = "reporter", type = EntityGraph.EntityGraphType.LOAD)
    List<Report> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(Report.EntityType entityType, Long entityId);
}
