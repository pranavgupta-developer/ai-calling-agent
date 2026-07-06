# Real Estate AI Calling Agent — Full Development Brief

## 1. Problem Statement

Real estate agents lose deals and waste hours every week because they can't answer every inbound inquiry instantly, at any hour, in the exact detail a buyer or renter wants. A prospective client calling about a listing at 9 PM, or messaging a website widget on a Sunday, often gets no response until the next business day — by which point they've moved on to a competing listing or agency.

**Build a multi-tenant SaaS platform** where real estate agents and agencies can:
- Deploy their own AI voice agent(s) that answer real phone calls and web chat, powered by conversational AI, with full knowledge of their live property listings, services, and pricing.
- Let that AI agent qualify leads, answer property questions, and book property-viewing appointments autonomously — 24/7.
- Manage everything (listings, appointments, payments, client communication) from a single dashboard.
- Optionally launch a full public-facing website (built-in website builder) or embed a widget into an existing site to expose the AI agent to visitors.

This is a B2B SaaS: **the customer is the real estate agent/agency**, and **the end user talking to the AI is the prospective buyer/renter/client**. The product must feel like a polished, sellable SaaS product — not a demo — with subscription tiers, usage limits, and a professional dashboard.

The platform is best understood as **six products combined into one**: a CRM, a property management system, an AI call center, a booking/scheduling system, a website builder, and subscription SaaS billing. Every feature built should serve one of those six pillars — this framing is a useful gut-check when scoping any new feature request during development.

### Target Customers & End Users

**Primary customers (B2B — the paying agency accounts):**
- Real estate agencies
- Property brokers
- Realtors (independent agents)
- Commercial property firms
- Rental agencies
- Property consultants
- Real estate startups

**End users (the people the AI agent actually talks to — never billed directly):**
- Home buyers
- Apartment renters
- Commercial property investors
- Property owners (e.g., landlords listing with an agency)
- Tenants

This distinction matters for the data model and permissions: build two clearly separate identity types from day one — **agency users** (dashboard access, billing, listings/agent config) and **client users** (portal-only access, scoped to their own appointments/payments) — rather than a single generic "user" role with permission flags bolted on later. It also matters for the product roadmap: features aimed at commercial investors (e.g., investment property analysis, ROI questions) may need different knowledge-base content and AI agent specialization than features aimed at individual home buyers or renters — worth keeping distinct "AI agent personas" per end-user segment rather than one generic agent config.

---

## 2. Tech Stack (and why)

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **Next.js 14 (App Router)** | Server components reduce client bundle size for a data-heavy dashboard; API routes double as your backend, so you don't need a separate server; excellent Vercel deployment story. |
| Styling | **Tailwind CSS** | Fast to build a consistent, professional dashboard UI without hand-rolling CSS; pairs well with component libraries like shadcn/ui. |
| Database, Auth, Storage | **Supabase (Postgres)** | Gives you a managed Postgres DB, row-level security for multi-tenant data isolation, built-in auth (email verification out of the box), and object storage for property images — all in one service, which matters a lot when you're moving fast. |
| Payments | **Stripe** | Industry standard; needed for two distinct flows — (a) SaaS subscription billing for agencies (Free/Pro/Business plans), and (b) one-off appointment/service payments collected from the agency's own clients. Use **Stripe Connect** for the second case so payments go to the agent's own Stripe account, not yours. |
| Conversational AI | **OpenAI API (GPT-4o / GPT-4o-mini)** | Powers the agent's reasoning, knowledge-base retrieval, and structured appointment-booking logic; function calling lets the model reliably trigger "book_appointment," "search_listings," etc. |
| Voice calling | **Twilio (Programmable Voice) + OpenAI Realtime API** | Twilio handles the actual PSTN phone number provisioning and call routing; OpenAI's Realtime API handles low-latency speech-to-speech conversation. Twilio's Media Streams feature bridges live call audio to the Realtime API over a WebSocket. |
| Email | **Resend.com** | Simple, reliable transactional email API for verification, appointment confirmations, cancellations, and notifications — much less config overhead than raw SMTP. |
| Hosting | **Vercel** | Zero-config Next.js deployment, automatic preview deployments per branch, edge functions for latency-sensitive routes. Note: Twilio's WebSocket media stream handler needs a persistent connection, so that specific piece (the voice bridge) should run on a small always-on service (Vercel serverless functions can time out on long-lived WebSockets) — plan for a lightweight Node/Fastify service on Railway or Fly.io just for the Twilio↔OpenAI audio bridge, with everything else on Vercel.

---

## 3. Core Requirements (Feature List)

### 3.1 Authentication & Business Setup
- Agent sign-up/login with email verification (Supabase Auth)
- Business profile: agency name, contact info, location, operating hours
- Stripe Connect onboarding (so the agency can receive client payments)
- Subscription plan selection: Free / Pro / Business (Stripe Billing)

### 3.2 Dashboard
- Overview cards: total listings, total conversations, total bookings, conversion rate
- Charts: call duration over time, bookings over time
- Recent activity feed (last calls, last bookings, last messages)
- Sidebar navigation to all modules below

### 3.3 Property Listings
- CRUD for listings: title, description, type (residential/apartment/commercial), sale or rental, price (fixed or monthly), bedrooms/bathrooms/parking/sq ft/year built, amenities (predefined + custom), up to 5+ images (Supabase Storage)
- Status: available / pending / sold; active/inactive toggle; "featured" flag
- Assign a listing to one or more specific AI agents (so an agent only discusses the properties it's assigned to)
- Filtering/search by type, status, price range

### 3.4 AI Agent Management
- Create/edit/delete AI agents (count limited by plan: 1 on Free, up to 99 on Pro/Business)
- Config per agent: name, voice (from Twilio/OpenAI voice options), language, personality/tone, greeting message, custom system prompt
- Assign services and listings to each agent (scopes what it can talk about)
- Test mode: simulate a text conversation or a form submission without making a real call
- Assign a phone number (via Twilio) to each active voice-enabled agent

### 3.5 Conversational AI Behavior
- Must be able to: answer property questions, filter/recommend listings, identify cheapest matching property, explain amenities/location/pricing, answer financing questions, collect budget, qualify the lead, and book an appointment — all via natural conversation (voice or chat)
- Uses OpenAI function calling with tools like `search_listings`, `get_listing_details`, `check_available_slots`, `create_appointment`, `lookup_knowledge_base`
- Retrieves from the agency's knowledge base (see 3.7) to answer FAQs

### 3.6 Services & Pricing
- 32 predefined service templates (e.g., buyer consultation, property viewing, residential sale/rental, commercial rental, investment consultation) — seed these in the DB
- Agents can edit, deactivate, or create custom services with fixed or range pricing
- Services can be free (e.g., first consultation free, viewing charged after)

### 3.7 Knowledge Base
- 40+ seeded real-estate Q&A pairs, editable/deletable
- Agents can add custom Q&A specific to their business
- Used as retrieval context for the AI agent's responses (simple keyword/embedding-based retrieval is sufficient — don't over-engineer this into a full vector DB unless listings volume is very large)

### 3.8 Appointments & Scheduling
- Manual, voice-booked, and website-booked appointments all land in one unified system
- Time-slot logic: respects business hours, auto-filters past slots, prevents double-booking
- Status flow: pending → confirmed → completed, or cancelled
- Reschedule flow with automatic email notifications to both parties
- Payment status per appointment: unpaid / paid-cash / paid-online (Stripe)

### 3.9 Client Portal
- Clients sign up/log in using the same email used at booking
- View, reschedule, cancel their own appointments
- Pay via Stripe (online) or mark cash payment
- Receive email confirmations for every status change

### 3.10 Communication
- Call logs (transcript + recording reference + duration) per conversation
- Real-time support ticket / chat system between client and agency, supporting text and image/file attachments

### 3.11 Website Builder & Widget
- Built-in website builder: theme (light/dark), fonts, branding, logo, hero image, FAQ section, contact page, footer, geolocation map — this is a paid add-on ($29/month)
- Embeddable widget: generates a React snippet and a plain HTML/JS snippet; customizable color, light/dark mode, greeting, and which AI agent it connects to

### 3.12 Notifications
- Email notifications (via Resend) for: verification, appointment confirmed/cancelled/rescheduled, payment received, new support message
- In-app notification center

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App (Vercel)                  │
│  ┌───────────────┐  ┌────────────────┐  ┌─────────────────┐ │
│  │  Agent Dashboard│  │ Client Portal  │  │ Public Website/  │ │
│  │  (protected)    │  │ (protected)    │  │ Widget (public)  │ │
│  └───────────────┘  └────────────────┘  └─────────────────┘ │
│              │                │                  │           │
│              └────────────────┴──────────────────┘           │
│                        Next.js API Routes                    │
└───────────┬───────────────────┬──────────────────┬───────────┘
            │                   │                  │
    ┌───────▼──────┐   ┌────────▼───────┐  ┌───────▼────────┐
    │   Supabase    │   │  Stripe (+     │  │  Resend (email)│
    │ Postgres/Auth/│   │  Stripe        │  │                │
    │   Storage     │   │  Connect)      │  │                │
    └───────────────┘   └────────────────┘  └────────────────┘
            │
    ┌───────▼─────────────────────────────────────────────┐
    │  Voice Bridge Service (Railway/Fly.io, always-on)     │
    │  Twilio Media Streams  ⇄  OpenAI Realtime API         │
    │  Chat-only conversations (widget/website) call        │
    │  OpenAI directly from Next.js API routes (no bridge)  │
    └────────────────────────────────────────────────────┘
```

Key design decisions:
- **Multi-tenancy via Row-Level Security**: every table (listings, agents, appointments, etc.) has an `agency_id`; Supabase RLS policies enforce that an agency can only read/write its own rows. This is your most important security boundary — get it right before building features on top.
- **Text chat vs. voice calls use different transports** but share the same underlying "agent brain" (a shared function/module that takes conversation history + tools and returns a response), so you don't duplicate AI logic.
- **Stripe Connect (not raw Stripe)** for agency-side payments, since the agency — not you — needs to receive the client's payment for a viewing/service.

---

## 5. Development Roadmap (6–8 Weeks)

**Week 1 — Foundation**
Set up Next.js + Tailwind + Supabase project. Implement auth (sign-up, email verification, login), business profile setup, and RLS policies/schema for agencies, users, and roles. Deploy a bare-bones app to Vercel early so the pipeline is proven from day one.

**Week 2 — Property Listings**
Build listing CRUD, image upload to Supabase Storage, filtering/search, status management, and the dashboard overview cards (can use placeholder/mock stats initially).

**Week 3 — Services & Knowledge Base**
Seed the 32 predefined services and 40+ knowledge base entries. Build CRUD and activate/deactivate UI for both. This is data-entry heavy but low-risk — good to front-load before the harder AI work.

**Week 4 — AI Agent Core (Chat)**
Build AI agent configuration (name, prompt, voice, personality, assigned listings/services). Implement the core conversational engine using OpenAI function calling (search_listings, get_listing_details, lookup_knowledge_base, check_available_slots) as a **text-chat** experience first — this de-risks the hardest part of the product before adding voice complexity.

**Week 5 — Appointments & Client Portal**
Build the scheduling engine (business hours, slot validation, booking creation via the `create_appointment` tool), appointment status flows, email notifications via Resend, and the client portal (view/reschedule/cancel, login by booking email).

**Week 6 — Voice Calling**
Provision Twilio numbers per active voice agent. Build the standalone voice-bridge service connecting Twilio Media Streams to the OpenAI Realtime API, reusing the same tool-calling logic from Week 4. Test end-to-end: real phone call → AI conversation → appointment booked → confirmation email sent.

**Week 7 — Payments, Widget, Website Builder**
Stripe Connect onboarding for agencies; Stripe Billing for Free/Pro/Business subscription tiers; per-appointment payment collection (cash/online). Build the embeddable widget (React + HTML/JS snippet generation) and the built-in website builder (theme, branding, hero, FAQ, footer, map).

**Week 8 — Support System, Polish, QA**
Build the real-time support ticket/chat system (text + file/image sharing). Full regression pass across every flow: sign-up → listing → agent config → chat/voice conversation → booking → payment → notification. Fix plan-limit enforcement (agent counts, appointment counts per tier). Performance pass, error-state handling, and deployment hardening.

*(Weeks 6–8 can be re-ordered if voice calling is not your immediate priority — text-chat + booking is a fully sellable MVP on its own after Week 5.)*

---

## 6. Day-by-Day Implementation Notes (Full 8-Week Breakdown)

**Week 1 — Foundation**
- Day 1: `create-next-app` (App Router), Tailwind config, shadcn/ui setup, Supabase project creation, connect env vars, deploy skeleton to Vercel so the pipeline is proven from day one.
- Day 2: Design core DB schema (agencies, agency_users, client_users, roles) with RLS enabled from the start — do not add RLS later, it's much harder to retrofit once tables have data and app code assumes open access.
- Day 3: Sign-up + email verification flow using Supabase Auth (agency-user path).
- Day 4: Login, session handling, protected route middleware, and role-based redirect (agency dashboard vs. client portal shell).
- Day 5: Business profile form (agency name, contact, location, operating hours) + save to DB; wire up basic settings page.

**Week 2 — Property Listings**
- Day 1: Listings table schema (`agency_id`, type, status, price fields, specs, amenities) + Supabase Storage bucket for images with per-agency folder isolation and RLS-equivalent storage policies.
- Day 2: Create/edit listing form covering all fields from section 3.3 (title, description, type, price type, bedrooms/bathrooms/parking/sq ft/year built, amenities).
- Day 3: Listing list view with filter/search (type, status, price range) + status badges (available/pending/sold) + active/inactive/featured toggles.
- Day 4: Image upload UI (multi-image, reorder, delete) wired to Supabase Storage.
- Day 5: Dashboard overview cards wired to real listing counts; bookings/conversion stats can remain placeholders until Week 5+.

**Week 3 — Services & Knowledge Base**
- Day 1: Services table schema + seed script for the 32 predefined service templates (buyer consultation, property viewing, residential/commercial sale/rental, investment consultation, etc.).
- Day 2: Service CRUD UI — edit name/description/pricing (fixed or range), activate/deactivate, create custom services.
- Day 3: Knowledge base table schema + seed script for 40+ real-estate Q&A entries.
- Day 4: Knowledge base CRUD UI — add/edit/delete entries, activate/deactivate, tag entries by category for later retrieval.
- Day 5: Build a simple retrieval function (keyword match, or lightweight embedding search if listing/KB volume is large) that the AI agent will call in Week 4 — test it standalone with sample queries before wiring it into the AI.

**Week 4 — AI Agent Core (Chat)**
- Day 1: AI agent config schema (name, prompt, voice selection, personality, language, greeting) + assignment tables linking agents to listings and services.
- Day 2: AI agent config UI — create/edit/delete agents, assign listings/services, plan-based agent count limits (server-side enforced, not just UI-hidden).
- Day 3: Core conversational engine — OpenAI function-calling setup with tools: `search_listings`, `get_listing_details`, `lookup_knowledge_base`, `check_available_slots` (stub the last one until Week 5's scheduling engine exists).
- Day 4: Text-chat UI (widget-style test panel) that talks to the agent's brain end-to-end; verify property filtering, cheapest-property queries, amenity/location/pricing explanations, and financing Q&A all work correctly.
- Day 5: "Test mode" feature — simulate a chat conversation or form submission against a given agent without a real client involved; this doubles as your own QA tool going forward.

**Week 5 — Appointments & Client Portal**
- Day 1: Appointment schema (agency_id, listing_id, agent_id, client info, status, payment status, timeslot) + business-hours schema per agency.
- Day 2: Scheduling engine — slot generation from business hours, automatic filtering of past slots, double-booking prevention; implement `create_appointment` and `check_available_slots` tools for real (unstub Week 4's placeholder).
- Day 3: Appointment status flows (pending → confirmed → completed, or cancelled) + reschedule logic; wire Resend for confirmation/cancellation/reschedule emails.
- Day 4: Client portal shell — client sign-up/login using the booking email, "my appointments" view.
- Day 5: Client-side reschedule/cancel actions + payment-status display (unpaid/cash/online placeholder until Week 7's Stripe work).

**Week 6 — Voice Calling**
- Day 1: Twilio account setup, phone number provisioning per active voice-enabled agent, and number-to-agent mapping in the DB.
- Day 2: Stand up the standalone voice-bridge service (Railway/Fly.io) — basic WebSocket server ready to accept Twilio Media Streams.
- Day 3: Connect Twilio Media Streams audio to the OpenAI Realtime API; get raw two-way audio working before adding any business logic.
- Day 4: Reuse the Week 4 "agent brain" (tools: search_listings, get_listing_details, lookup_knowledge_base, create_appointment) inside the Realtime voice session so voice and chat share identical logic.
- Day 5: End-to-end test: real phone call → live AI conversation → appointment booked → confirmation email sent → appears correctly on the dashboard. Measure and tune latency (this is the highest-risk day of the whole roadmap — don't skip dedicated time for it).

**Week 7 — Payments, Widget, Website Builder**
- Day 1: Stripe Connect onboarding flow for agencies (so agencies receive their own clients' payments) — keep this fully separate from Stripe Billing.
- Day 2: Stripe Billing integration for Free/Pro/Business subscription tiers; webhook handling for subscription created/updated/cancelled (idempotent).
- Day 3: Per-appointment payment collection — online (Stripe test mode) and cash — with webhook-driven status updates on the appointment record.
- Day 4: Embeddable widget — generate React snippet and plain HTML/JS embed code; customizable color, light/dark mode, greeting, agent selection.
- Day 5: Built-in website builder — theme (light/dark), fonts, branding, logo/hero upload, FAQ section, contact page, footer, geolocation map; publish flow gated behind the $29/month add-on subscription.

**Week 8 — Support System, Polish, QA**
- Day 1: Support ticket/chat schema + real-time messaging (text) between client and agency.
- Day 2: File/image sharing within support tickets; message history and read/unread status in both dashboards.
- Day 3: Full regression pass across every core flow: sign-up → listing → agent config → chat/voice conversation → booking → payment → notification.
- Day 4: Plan-limit enforcement audit (agent counts, appointment counts per tier) — verify server-side checks can't be bypassed via direct API calls; error-state and empty-state pass across all screens.
- Day 5: Performance pass (query indexes on `agency_id` columns, image optimization, Realtime voice latency re-check), deployment hardening, and final production environment variable/config review before launch.

*(Weeks 6–8 can be re-ordered if voice calling is not your immediate priority — text-chat + booking is a fully sellable MVP on its own after Week 5.)*

---

## 7. Important Considerations

- **Multi-tenant data isolation is non-negotiable.** Every query must be scoped by `agency_id` via RLS, not just application-level filtering — a bug in a WHERE clause should never be able to leak another agency's client data.
- **Voice latency budget.** The Twilio↔OpenAI Realtime bridge needs to run on infrastructure with a persistent connection and low network hop count to OpenAI; test real call latency early (Week 6), don't leave it to the end.
- **Plan-limit enforcement.** Free/Pro/Business limits (agent count, appointment count) need to be checked server-side on every creation action, not just hidden in the UI — otherwise a Free user could bypass limits via direct API calls.
- **Stripe Connect vs. Stripe Billing are two separate integrations** — don't conflate them. Billing charges the agency for your SaaS subscription; Connect lets the agency receive their own clients' payments.
- **PII and call recordings.** Call transcripts/recordings contain client PII (name, phone, budget); store access-controlled and have a clear retention/deletion policy, especially if you'll operate in regions with GDPR-like rules.
- **Idempotency on webhooks.** Stripe and Twilio both send webhooks that can be delivered more than once — make appointment/payment status updates idempotent (check current state before transitioning).
- **Time zones.** Business hours and slot booking must be stored/computed in the agency's configured timezone, not the server's or the client's browser timezone, to avoid slot-mismatch bugs.
- **Graceful AI fallback.** If the AI can't confidently answer or the function call fails (e.g., no listings match), it should offer to connect the client to a human or take a message — never dead-end the conversation.
- **Testing tools are a real feature, not a nice-to-have.** Agencies will not trust an AI agent with real client calls unless they can test it first — prioritize the "simulate call/form" tooling as a first-class feature, not an afterthought.