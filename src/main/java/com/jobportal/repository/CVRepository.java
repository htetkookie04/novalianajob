package com.jobportal.repository;

import com.jobportal.entity.CV;
import com.jobportal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CVRepository extends JpaRepository<CV, Long> {
    List<CV> findByUser(User user);
    Optional<CV> findByIdAndUser(Long id, User user);
    boolean existsByUserAndFileName(User user, String fileName);
}

