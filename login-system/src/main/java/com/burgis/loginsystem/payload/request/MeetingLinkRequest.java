package com.burgis.loginsystem.payload.request;

public class MeetingLinkRequest {
    private String userName;
    private String meetingLink;

    // Getter methods
    public String getUserName() {
        return userName;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    // Setter methods
    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }
}

