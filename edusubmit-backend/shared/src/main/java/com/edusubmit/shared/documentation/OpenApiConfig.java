package com.edusubmit.shared.documentation;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI edusubmitOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("EduSubmit API Documentation")
                        .description("Comprehensive API documentation for EduSubmit - AI-powered academic portal for assignment submission and grading")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("EduSubmit Development Team")
                                .email("admin@edusubmit.com")
                                .url("https://edusubmit.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .externalDocs(new ExternalDocumentation()
                        .description("EduSubmit Documentation")
                        .url("https://docs.edusubmit.com"))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Development Server"),
                        new Server()
                                .url("https://api.edusubmit.com")
                                .description("Production Server"),
                        new Server()
                                .url("https://staging-api.edusubmit.com")
                                .description("Staging Server")))
                .tags(List.of(
                        new Tag()
                                .name("Authentication")
                                .description("User authentication and authorization endpoints"),
                        new Tag()
                                .name("Users")
                                .description("User management endpoints"),
                        new Tag()
                                .name("Assignments")
                                .description("Assignment creation, submission, and grading endpoints"),
                        new Tag()
                                .name("Courses")
                                .description("Course management endpoints"),
                        new Tag()
                                .name("Submissions")
                                .description("Assignment submission and file upload endpoints"),
                        new Tag()
                                .name("Analytics")
                                .description("Analytics and reporting endpoints"),
                        new Tag()
                                .name("Admin")
                                .description("Administrative endpoints"),
                        new Tag()
                                .name("Health")
                                .description("Health check and monitoring endpoints")))
                .components(new Components()
                        .addSecuritySchemes("bearer-authentication", 
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT token for authentication"))
                        .addSecuritySchemes("api-key-authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER)
                                        .name("X-API-Key")
                                        .description("API key for programmatic access")))
                .addSecurityItem(new SecurityRequirement().addList("bearer-authentication"))
                .addSecurityItem(new SecurityRequirement().addList("api-key-authentication"));
    }
}
