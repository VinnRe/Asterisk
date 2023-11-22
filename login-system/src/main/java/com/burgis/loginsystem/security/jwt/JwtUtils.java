package com.burgis.loginsystem.security.jwt;

import java.security.Key;
import java.time.Duration;
import java.util.Date;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import com.burgis.loginsystem.security.services.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtils {
  private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

  @Value("${burgis.app.jwtSecret}")
  private String jwtSecret;

  @Value("${burgis.app.jwtExpirationMs}")
  private int jwtExpirationMs;

  @Value("${burgis.app.jwtCookieName}")
  private String jwtCookie;

  public String getJwtFromCookies(HttpServletRequest request) {
    Cookie cookie = WebUtils.getCookie(request, jwtCookie);
    if (cookie != null) {
      return cookie.getValue();
    } else {
      return null;
    }
  }

  public ResponseCookie generateJwtCookie(UserDetailsImpl userPrincipal) {
    String jwt = generateJwtToken(userPrincipal);
    ResponseCookie cookie = ResponseCookie.from(jwtCookie, jwt)
            .path("/")
            .maxAge(Duration.ofMinutes(jwtExpirationMs / 60000)) // Convert milliseconds to minutes
            .httpOnly(true)
            .build();
    return cookie;
  }

  public String generateJwtToken(UserDetailsImpl userPrincipal) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

    return Jwts.builder()
            .setSubject(userPrincipal.getUsername())
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(key(), SignatureAlgorithm.HS256)
            .compact();
  }

public ResponseCookie updateJwtCookie(UserDetailsImpl userDetails, String newJwtToken) {
    ResponseCookie cookie = ResponseCookie.from(jwtCookie, newJwtToken)
            .path("/api")
            .maxAge(24 * 60 * 60)
            .httpOnly(true)
            .build();
    return cookie;
}

  public ResponseCookie getCleanJwtCookie() {
    ResponseCookie cookie = ResponseCookie.from(jwtCookie, "")
            .path("/")
            .maxAge(Duration.ofSeconds(0))
            .build();
    return cookie;
  }

  public String getUserNameFromJwtToken(String token) {
    return Jwts.parserBuilder().setSigningKey(key()).build()
        .parseClaimsJws(token).getBody().getSubject();
  }

  public String getEmailFromJwtToken(String token) {
    return Jwts.parserBuilder().setSigningKey(key()).build()
        .parseClaimsJws(token).getBody().getSubject();
  }

  public UserDetails getUserDetailsFromJwtToken(String token) {
    Claims claims = Jwts.parserBuilder().setSigningKey(key()).build()
            .parseClaimsJws(token).getBody();

    String email = claims.getSubject();
    // Retrieve other details from claims as needed
    String id = claims.get("id", String.class);
    String firstName = claims.get("firstName", String.class);
    String middleName = claims.get("middleName", String.class);
    String lastName = claims.get("lastName", String.class);
    String nameExtension = claims.get("nameExtension", String.class);
    String gender = claims.get("gender", String.class);
    String birthdate = claims.get("birthdate", String.class);

    return new UserDetailsImpl(
            id,
            email,
            "", // Assuming password is not stored in the token; you may adjust as needed
            firstName,
            middleName,
            lastName,
            nameExtension,
            gender,
            birthdate
    );
}

  private Key key() {
    return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
  }

  public boolean validateJwtToken(String authToken) {
    try {
      Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
      return true;
    } catch (MalformedJwtException e) {
      logger.error("Invalid JWT token: {}", e.getMessage());
    } catch (ExpiredJwtException e) {
      logger.error("JWT token is expired: {}", e.getMessage());
    } catch (UnsupportedJwtException e) {
      logger.error("JWT token is unsupported: {}", e.getMessage());
    } catch (IllegalArgumentException e) {
      logger.error("JWT claims string is empty: {}", e.getMessage());
    }

    return false;
  }
}
