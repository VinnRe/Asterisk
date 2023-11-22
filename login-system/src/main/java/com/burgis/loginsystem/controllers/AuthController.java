package com.burgis.loginsystem.controllers;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.burgis.loginsystem.models.User;
import com.burgis.loginsystem.payload.request.EditRequest;
import com.burgis.loginsystem.payload.request.LoginRequest;
import com.burgis.loginsystem.payload.request.SignupRequest;
import com.burgis.loginsystem.payload.response.UserInfoResponse;
import com.burgis.loginsystem.payload.response.MessageResponse;
import com.burgis.loginsystem.repository.UserRepository;
import com.burgis.loginsystem.security.jwt.JwtUtils;
import com.burgis.loginsystem.security.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
  @Autowired
  AuthenticationManager authenticationManager;

  @Autowired
  UserRepository userRepository;

  @Autowired
  PasswordEncoder encoder;

  @Autowired
  JwtUtils jwtUtils;

  @PostMapping("/signin")
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

    Authentication authentication = authenticationManager
        .authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

    SecurityContextHolder.getContext().setAuthentication(authentication);

    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

    ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);


        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
        .body((Object) new UserInfoResponse(
                    userDetails.getId(),
                    userDetails.getEmail(),
                    userDetails.getFirstName(),
                    userDetails.getMiddleName(),
                    userDetails.getLastName(),
                    userDetails.getNameExtension(),
                    userDetails.getGender(),
                    userDetails.getBirthdate()
                ));
  }

  @PostMapping("/signup")
  public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {

      if (userRepository.existsByEmail(signUpRequest.getEmail())) {
          return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
      }

      String id = CustomIdGenerator.generateCustomId();

      User user = new User(
        id,
        signUpRequest.getEmail(),
        encoder.encode(signUpRequest.getPassword()),
        signUpRequest.getFirstName(),
        signUpRequest.getMiddleName(),
        signUpRequest.getLastName(),
        signUpRequest.getNameExtension(),
        signUpRequest.getGender(),
        signUpRequest.getBirthdate()
    );


      userRepository.save(user);

      return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
  }

  @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        try {
            userRepository.deleteById(userDetails.getId());

            return ResponseEntity.ok(new MessageResponse("Account deleted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to delete the account."));
        }
    }

    @PutMapping("/account")
    public ResponseEntity<?> editAccountInformation(@Valid @RequestBody EditRequest editRequest) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found."));
        }

        if (editRequest.getFirstName() != null) {
            user.setFirstName(editRequest.getFirstName());
        }
        if (editRequest.getMiddleName() != null) {
            user.setMiddleName(editRequest.getMiddleName());
        }
        if (editRequest.getLastName() != null) {
            user.setLastName(editRequest.getLastName());
        }
        if (editRequest.getNameExtension() != null) {
            user.setNameExtension(editRequest.getNameExtension());
        }
        if (editRequest.getGender() != null) {
            user.setGender(editRequest.getGender());
        }
        if (editRequest.getBirthdate() != null) {
            user.setBirthdate(editRequest.getBirthdate());
        }

        try {
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("Account information updated successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to update account information."));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String newJwtToken = jwtUtils.generateJwtToken(userDetails);

        ResponseCookie jwtCookie = jwtUtils.updateJwtCookie(userDetails, newJwtToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(new MessageResponse("Token refreshed successfully!"));
    }

  @PostMapping("/signout")
  public ResponseEntity<?> logoutUser() {
    ResponseCookie cookie = jwtUtils.getCleanJwtCookie();
    return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body(new MessageResponse("You've been signed out!"));
  }
}