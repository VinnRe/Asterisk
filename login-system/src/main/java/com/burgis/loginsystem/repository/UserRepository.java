package com.burgis.loginsystem.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.burgis.loginsystem.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
  Optional<User> findById(String id);
  Optional<User> findByEmail(String email);

  Boolean existsByEmail(String email);
}