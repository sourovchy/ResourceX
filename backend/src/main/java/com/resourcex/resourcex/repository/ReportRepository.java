package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.Report;
import com.resourcex.resourcex.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    @EntityGraph(attributePaths = {"reporter", "reportedUser", "reportedItem", "reportedItem.owner"}, type = EntityGraph.EntityGraphType.LOAD)
    List<Report> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"reporter", "reportedUser", "reportedItem", "reportedItem.owner"}, type = EntityGraph.EntityGraphType.LOAD)
    List<Report> findByStatusOrderByCreatedAtDesc(Report.ReportStatus status);

    @EntityGraph(attributePaths = {"reporter", "reportedUser", "reportedItem", "reportedItem.owner"}, type = EntityGraph.EntityGraphType.LOAD)
    List<Report> findByReporter_UserIdOrderByCreatedAtDesc(Long reporterId);

    @EntityGraph(attributePaths = {"reporter", "reportedUser", "reportedItem", "reportedItem.owner"}, type = EntityGraph.EntityGraphType.LOAD)
    List<Report> findByReportedUserOrderByCreatedAtDesc(User reportedUser);

    @EntityGraph(attributePaths = {"reporter", "reportedUser", "reportedItem", "reportedItem.owner"}, type = EntityGraph.EntityGraphType.LOAD)
    List<Report> findByReportedItemOrderByCreatedAtDesc(Item reportedItem);

    boolean existsByReporter_UserIdAndReportedUser(Long reporterId, User reportedUser);

    boolean existsByReporter_UserIdAndReportedItem(Long reporterId, Item reportedItem);

    List<Report> findByReportedUserAndStatus(User reportedUser, Report.ReportStatus status);
}
