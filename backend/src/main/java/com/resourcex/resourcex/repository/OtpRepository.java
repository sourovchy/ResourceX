package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.OtpStatus;
import com.resourcex.resourcex.entity.OtpToken;
import com.resourcex.resourcex.entity.TokenPurpose;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.LockModeType;

import java.time.Instant;
import java.util.List;

@Repository
public interface OtpRepository extends JpaRepository<OtpToken, Long> {

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("""
                        select o from OtpToken o
                        where lower(o.email) = lower(:email)
                        and o.tokenPurpose = :purpose
                        and o.status = :status
                        order by o.createdAt desc, o.id desc
                        """)
        List<OtpToken> findByEmailAndTokenPurposeAndStatusForUpdate(
                        @Param("email") String email,
                        @Param("purpose") TokenPurpose purpose,
                        @Param("status") OtpStatus status);

        @Query("""
                        select o from OtpToken o
                        where lower(o.email) = lower(:email)
                        and o.tokenPurpose = :purpose
                        order by o.createdAt desc
                        """)
        List<OtpToken> findAllByEmailAndTokenPurpose(
                        @Param("email") String email,
                        @Param("purpose") TokenPurpose purpose);

        @Modifying
        @Transactional
        @Query("""
                        update OtpToken o
                        set o.status = :expiredStatus
                        where lower(o.email) = lower(:email)
                          and o.tokenPurpose = :purpose
                          and o.status = :activeStatus
                          and o.expiresAt <= :now
                        """)
        int expireExpiredOtpForEmailAndTokenPurpose(
                        @Param("email") String email,
                        @Param("purpose") TokenPurpose purpose,
                        @Param("expiredStatus") OtpStatus expiredStatus,
                        @Param("activeStatus") OtpStatus activeStatus,
                        @Param("now") Instant now);

        @Modifying
        @Transactional
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

        long countByEmailAndTokenPurposeAndCreatedAtAfter(
                        String email,
                        TokenPurpose tokenPurpose,
                        Instant after);

        long deleteByStatusInAndExpiresAtBefore(
                        List<OtpStatus> statuses,
                        Instant before);
}
