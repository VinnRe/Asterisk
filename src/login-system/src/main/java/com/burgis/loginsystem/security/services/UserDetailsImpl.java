package com.burgis.loginsystem.security.services;

import java.util.Collection;
import java.util.Objects;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.List;

import com.burgis.loginsystem.models.User;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private String id;
    private String email;
    private String password;
    private String firstName;
    private String middleName;
    private String lastName;
    private String nameExtension;
    private String gender;
    private String birthdate;

    public UserDetailsImpl(String id, String email, String password, String firstName, String middleName, String lastName, String nameExtension, String gender, String birthdate) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
        this.nameExtension = nameExtension;
        this.gender = gender;
        this.birthdate = birthdate;
    }

    public static UserDetailsImpl build(User user) {
        return new UserDetailsImpl(
            user.getId(),
            user.getEmail(),
            user.getPassword(),
            user.getFirstName(),
            user.getMiddleName(),
            user.getLastName(),
            user.getNameExtension(),
            user.getGender(),
            user.getBirthdate()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    public String getFirstName(){
        return firstName;
    }

    public String getMiddleName(){
        return middleName;
    }

    public String getLastName(){
        return lastName;
    }

    public String getNameExtension(){
        return nameExtension;
    }

    public String getGender(){
        return gender;
    }

    public String getBirthdate(){
        return birthdate;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
}
