package com.edusubmit.shared.security;

import com.edusubmit.shared.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPrincipal {
    private Long id;
    private String email;
    private String name;
    private UserRole role;
    private Collection<String> authorities;
    
    public static UserPrincipal create(Long id, String email, String name, UserRole role) {
        return new UserPrincipal(id, email, name, role, List.of("ROLE_" + role.name()));
    }
}
