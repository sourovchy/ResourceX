package com.thirdhand.campusvault.repository;

import com.thirdhand.campusvault.entity.OtpStatus;
import com.thirdhand.campusvault.entity.OtpToken;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.List;

public interface OtpRepository extends JpaRepository<OtpToken, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
           select o from OtpToken o
           where lower(o.email) = lower(:email)
             and o.status = :status
             and o.expiresAt > :now
           order by o.createdAt desc
           """)
    List<OtpToken> findActiveForUpdate(@Param("email") String email,
                                       @Param("status") OtpStatus status,
                                       @Param("now") Instant now);

    @Modifying
    @Query("""
           update OtpToken o
           set o.status = :expiredStatus
           where lower(o.email) = lower(:email)
             and o.status = :activeStatus
             and o.expiresAt > :now
           """)
    int expireActiveOtp(@Param("email") String email,
                        @Param("expiredStatus") OtpStatus expiredStatus,
                        @Param("activeStatus") OtpStatus activeStatus,
                        @Param("now") Instant now);
}