package com.burgis.loginsystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.burgis.loginsystem.models.MeetingLink;

@Repository
public interface MeetingLinkRepository extends JpaRepository<MeetingLink, String> {
    boolean existsByMeetingLink(String meetingLink);
}
