# 청약알리미 작업 안내

> 전체 지도와 공통 규칙: [RoHumanist/claude-kit README](https://github.com/RoHumanist/claude-kit/blob/main/README.md). 이 저장소의 단위 ID: chungya-bot. 세션 시작과 종료는 claude-kit `0_원칙/위계_원칙.md` 4절과 5절을 따릅니다. claude-kit이 세션에 없으면 읽기 권한으로 붙여 읽습니다.
> 붙이지 못하면 적어도 넷을 합니다. (1) 커밋하고 push합니다. (2) 단위 README `## 상태` 첫 줄을 날짜와 커밋으로 바꿉니다. (3) main 반영 여부를 Shawn에게 한 줄로 묻습니다. (4) 현황판 마무리 질문 "이 작업 완결, 나중에, 계속 진행 중 어느 쪽인가요?"(claude-kit `0_도구/진행현황/SKILL.md` 1절)를 그 글자대로 묻습니다. 끝으로 브랜치 이름과 함께 허브에 기록하지 못했다고 말합니다.

저장소 설명과 현재 상태는 [CONTEXT.md](CONTEXT.md)에 있다.

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->
