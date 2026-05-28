# EduSubmit Build TODO

## Phase 1 — Backend wiring + contract enforcement
- [ ] Read and verify each backend service directory exists under `edusubmit-backend/` (auth, assignment, submission, grading, notification, exam-schedule) and whether they are registered as Maven modules.
- [x] Update `edusubmit-backend/pom.xml` to include missing microservices as modules (keeping your architecture unchanged).

- [x] Enforce consistent response wrapper `{ success, data, message }` across auth/gateway/assignment/submission/grading/exams/notifications.


- [ ] Implement/adjust endpoints to match the exact paths and RBAC rules from the spec (e.g., `/api/auth/login`, `/api/assignments/**`, `/api/submissions/**`, `/api/grades/**`, `/api/exams/**`, `/api/notifications/**`, `/api/admin/**`).
- [ ] Validate JWT implementation: JJWT, BCrypt hashing, 24h expiry, claims: `userId,email,role`, secret from `JWT_SECRET`.

## Phase 2 — AI engine contract alignment
- [ ] Ensure Flask endpoints/JSON fields exactly match spec (`/ai/grade`, `/ai/plagiarism-check`, `/ai/help`).

## Phase 3 — Docker Compose alignment
- [ ] Replace/extend root `docker-compose.yml` and `edusubmit-backend/docker-compose.prod.yml` to start every required service on the required ports (8081..8086 etc.) plus monitoring/ELK/Vault as specified.
- [ ] Ensure each container uses multi-stage Docker builds and non-root user.

## Phase 4 — Frontend alignment
- [ ] Align React routes and API calls to spec paths and dashboards.

## Phase 5 — Tests and CI/CD
- [ ] Add/verify unit tests (JUnit 5) for auth/submission/grading.
- [ ] Add integration tests (Testcontainers) for MySQL/MinIO.
- [ ] Add E2E tests (Selenium) matching the spec flows.
- [ ] Create GitHub Actions workflow CI/CD per spec.

## Phase 6 — Kubernetes, Monitoring, ELK, Vault, Terraform, ArgoCD, PagerDuty
- [ ] Populate `k8s/` manifests per spec.
- [ ] Verify Prometheus+Grafana dashboards and alert rules.
- [ ] Verify ELK (Logstash) config.
- [ ] Wire Vault secrets into Spring Boot via bootstrap.yml + vault config.
- [ ] Populate Terraform + ArgoCD + PagerDuty alerting.
