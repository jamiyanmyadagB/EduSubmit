package com.edusubmit.shared.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

/**
 * Aspect that enforces @RequireRole.
 *
 * It checks whether the authenticated principal has an authority that matches the required role.
 */
@Aspect
@Component
public class RequireRoleAspect {

    @Around("@annotation(requireRole) || @within(requireRole)")
    public Object enforce(ProceedingJoinPoint pjp, RequireRole requireRole) throws Throwable {
        String required = requireRole.value();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Missing authentication");
        }

        boolean has = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals(required));

        if (!has) {
            throw new AccessDeniedException("Forbidden: requires role " + required);
        }

        return pjp.proceed();
    }

    @Around("execution(* *(..))")
    public Object enforceTypeLevel(ProceedingJoinPoint pjp) throws Throwable {
        MethodSignature signature = (MethodSignature) pjp.getSignature();
        Method method = signature.getMethod();

        RequireRole requireRole = method.getAnnotation(RequireRole.class);
        if (requireRole == null) {
            requireRole = method.getDeclaringClass().getAnnotation(RequireRole.class);
        }

        if (requireRole == null) {
            return pjp.proceed();
        }

        return enforce(pjp, requireRole);
    }
}

