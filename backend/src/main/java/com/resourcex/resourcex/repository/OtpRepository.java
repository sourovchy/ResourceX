package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.OtpStatus;
import com.resourcex.resourcex.entity.OtpToken;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;

import java.time.Instant;
import java.util.List;

@Repository
public interface OtpRepository extends JpaRepository<OtpToken, Long> {

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("""
                        select o from OtpToken o
                        where lower(o.email) = lower(:email)
                        and o.status = :status
                        order by o.createdAt desc, o.id desc
                        """)
        List<OtpToken> findByEmailAndStatusForUpdate(
                        @Param("email") String email,
                        @Param("status") OtpStatus status);

        @Query("""
                        select o from OtpToken o
                        where lower(o.email) = lower(:email)
                        order by o.createdAt desc
                        """)
        List<OtpToken> findAllByEmail(
                        @Param("email") String email);

        @Modifying
        @Query("""
                        update OtpToken o
                        set o.status = :expiredStatus
                        where lower(o.email) = lower(:email)
                          and o.status = :activeStatus
                          and o.expiresAt <= :now
                        """)
        int expireExpiredOtpForEmail(
                        @Param("email") String email,
                        @Param("expiredStatus") OtpStatus expiredStatus,
                        @Param("activeStatus") OtpStatus activeStatus,
                        @Param("now") Instant now);

        @Modifying
        @Query("""
                        update OtpToken o
                        set o.status = :expiredStatus
                        where o.status = :activeStatus
                          and o.expiresAt <= :now
                        """)
        int expireExpiredOtp(
                        @Param("expiredStatus") OtpStatus expiredStatus,
                        @Param("activeStatus") OtpStatus activeStatus,
                        @Param("now") Instant now);

        long countByEmailIgnoreCase(String email);

        long countByEmailAndCreatedAtAfter(
                        String email,
                        Instant after);

        long deleteByStatusInAndExpiresAtBefore(
                        List<OtpStatus> statuses,
                        Instant before);
}
