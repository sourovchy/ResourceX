package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.OtpToken;
import com.resourcex.resourcex.entity.TokenPurpose;
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
                        and o.tokenPurpose = :purpose
                        and o.usedAt is null
                        order by o.id desc
                        """)
        List<OtpToken> findUnusedTokenForUpdate(
                        @Param("email") String email,
                        @Param("purpose") TokenPurpose purpose);

        @Query("""
                        select o from OtpToken o
                        where lower(o.email) = lower(:email)
                        and o.tokenPurpose = :purpose
                        order by o.id desc
                        """)
        List<OtpToken> findAllByEmailAndTokenPurpose(
                        @Param("email") String email,
                        @Param("purpose") TokenPurpose purpose);

        long countByEmailIgnoreCase(String email);

        long countByEmailAndTokenPurposeAndLastSentAtAfter(
                        String email,
                        TokenPurpose tokenPurpose,
                        Instant after);

        @Modifying
        @Query("delete from OtpToken o where o.expiresAt < :threshold")
        void deleteExpiredBefore(@Param("threshold") Instant threshold);

        @Modifying
        @Query("delete from OtpToken o where lower(o.email) = lower(:email)")
        void deleteAllByEmailIgnoreCase(@Param("email") String email);
}
