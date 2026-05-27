# Security Module

This module contains centralized security configurations and policies for the EduSubmit application.

## Configuration Files

- `security-config.yaml` - Centralized security configuration including:
  - JWT settings
  - Password security policies
  - Rate limiting rules
  - CORS configuration
  - SSL/TLS settings
  - API key management
  - Session security
  - File upload security
  - Data encryption
  - Audit logging
  - Security headers
  - IP whitelisting
  - Two-factor authentication
  - Account lockout policies

## Usage

The security configuration is loaded by the backend services at startup. Environment variables can be used to override default values:

```bash
export JWT_SECRET=your-secret-key
export SSL_ENABLED=true
export 2FA_ENABLED=true
```

## Security Best Practices

1. **Never commit secrets** - Use environment variables or secret management systems
2. **Rotate credentials regularly** - Update JWT secrets and API keys periodically
3. **Enable SSL in production** - Always use HTTPS in production environments
4. **Monitor audit logs** - Regularly review security audit logs for suspicious activity
5. **Keep dependencies updated** - Regularly update security patches for all dependencies

## Security Headers

The following security headers are enforced:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- Content-Security-Policy: Default-src 'self'

## Rate Limiting

Default rate limits:
- General API: 100 requests per minute
- Authentication endpoints: 10 requests per 5 minutes
- Submission endpoints: 50 requests per minute
- File upload: 20 requests per minute

## Password Policy

- Minimum length: 8 characters
- Requires: uppercase, lowercase, digit, special character
- BCrypt encoding strength: 10
- Password history: 5 previous passwords
- Maximum age: 90 days
