package com.burgis.loginsystem.models;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
    @Entity
public class MeetingLink {
    @Id
    private String meetingLink;
    private String userName;

    // Constructors, getters, and setters...

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    // Additional methods or custom logic if needed...
}

