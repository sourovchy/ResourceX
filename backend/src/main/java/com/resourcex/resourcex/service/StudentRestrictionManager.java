package com.resourcex.resourcex.service;

import com.resourcex.resourcex.entity.StudentRestriction;
import com.resourcex.resourcex.repository.StudentRestrictionRepository;
import com.resourcex.resourcex.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Convenience access to a student's {@link StudentRestriction} (0..1 per student).
 * Centralizes the get-or-create and "is currently restricted" checks so callers
 * don't duplicate the lazy-creation logic.
 */
@Component
@RequiredArgsConstructor
public class StudentRestrictionManager {

    private final StudentRestrictionRepository restrictionRepository;
    private final StudentProfileRepository studentProfileRepository;

    public Optional<StudentRestriction> find(Long studentUserId) {
        return restrictionRepository.findByStudentUserId(studentUserId);
    }

    /** Returns the existing restriction or a new (unsaved) one bound to the student. */
    public StudentRestriction getOrCreate(Long studentUserId) {
        return restrictionRepository.findByStudentUserId(studentUserId)
                .orElseGet(() -> StudentRestriction.builder()
                        .studentUserId(studentUserId)
                        .build());
    }

    public StudentRestriction save(StudentRestriction restriction) {
        return restrictionRepository.save(restriction);
    }

    /** True when the student is currently under an automatic low-trust restriction. */
    public boolean isAutomaticallyRestricted(Long studentUserId) {
        return studentProfileRepository.findByUser_UserId(studentUserId)
                .map(r -> r.getTrustScore() != null && r.getTrustScore() < 50)
                .orElse(false);
    }
}
