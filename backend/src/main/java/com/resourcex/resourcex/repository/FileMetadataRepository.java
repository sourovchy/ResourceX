package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.FileMetadata;
import com.resourcex.resourcex.entity.FilePurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadata, Long> {

    Optional<FileMetadata> findByFileUrl(String fileUrl);

    /** The current file of a given purpose for a user (latest wins) — e.g. AVATAR or STUDENT_ID. */
    Optional<FileMetadata> findFirstByUser_UserIdAndPurposeOrderByFileIdDesc(Long userId, FilePurpose purpose);

    /** All files of a given purpose for a user (used to prune superseded avatars). */
    List<FileMetadata> findByUser_UserIdAndPurpose(Long userId, FilePurpose purpose);

    /** All files whose purpose is in the given set — used by the one-time image purge. */
    List<FileMetadata> findByPurposeIn(Collection<FilePurpose> purposes);

    /**
     * Batched purpose-file lookup for many users at once — used to resolve avatars
     * for a whole page of items/users in a single query instead of N per-user
     * queries (eliminates an N+1). Rows: [userId (Long), fileUrl (String), fileId (Long)],
     * ascending by fileId so callers can keep the latest (max fileId) per user.
     */
    @Query("SELECT f.user.userId, f.fileUrl, f.fileId FROM FileMetadata f "
            + "WHERE f.purpose = :purpose AND f.user.userId IN :userIds "
            + "ORDER BY f.fileId ASC")
    List<Object[]> findFilesByPurposeAndUserIds(@Param("purpose") FilePurpose purpose,
                                                @Param("userIds") Collection<Long> userIds);

}
