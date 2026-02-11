# Product Requirements Document (PRD) - Lala System

**Version:** 1.8
**Date:** 2026-02-11
**Status:** Multi-Tenant Production Ready

## 1. Product Overview
Lala System is a SaaS management platform for beauty salons, designed to streamline operations including scheduling, client management, inventory control, and financial transactions. 

**Core Value Proposition:**
- **Efficiency:** Unified interface for scheduling and sales.
- **Control:** Strict inventory and financial tracking.
- **Security:** Multi-tenant architecture ensuring data isolation between different salons.

## 2. Target Audience (User Personas)

### 2.1. The Administrator (Owner)
- **Goal:** Full control over the business, financial reports, and inventory management.
- **Key Actions:** Manage products, suppliers, view dashboard, configure system.

### 2.2. The Receptionist / Professional
- **Goal:** Efficiently manage the daily schedule and process client payments.
- **Key Actions:** Create appointments, register clients, checkout/finalize services.

## 3. User Stories & Acceptance Criteria

### 3.1. Client Management
**User Story:** As a User, I want to register a new client so that I can schedule services for them.
- **Acceptance Criteria 1:** User can access the "New Client" form.
- **Acceptance Criteria 2:** System requires "Name", "Birth Date", and "City".
- **Acceptance Criteria 3:** System prevents duplicate client records based on strict fields if applicable (though currently allows same name).
- **Acceptance Criteria 4:** Upon saving, the client is created with "Active" status and zero credit balance.
- **Acceptance Criteria 5:** The created client is ONLY visible to the current Tenant.

### 3.2. Appointment Scheduling
**User Story:** As a User, I want to schedule a service for a client to reserve a time slot.
- **Acceptance Criteria 1:** User can select a Client, Professional, and one or more Services.
- **Acceptance Criteria 2:** System displays available time slots based on Professional availability.
- **Acceptance Criteria 3:** System blocks times that are already marked as "Blocked" (e.g., lunch break).
- **Acceptance Criteria 4:** System ALLOWS overbooking (multiple appointments at the same time) as per business rule.
- **Acceptance Criteria 5:** Appointment is created with "Pending" status.
- **Acceptance Criteria 6:** The ID generated for the appointment must be a valid UUID.

### 3.3. Sales & Checkout
**User Story:** As a User, I want to finalize an appointment and process payment so that I can generate revenue and update inventory.
- **Acceptance Criteria 1:** User can convert an Appointment into a Sale via "Checkout" button.
- **Acceptance Criteria 2:** User can add extra Products to the sale during checkout.
- **Acceptance Criteria 3:** User can select multiple payment methods (Split Payment), e.g., part Cash, part Credit Card.
- **Acceptance Criteria 4:** If "Cash" is selected, system calculates "Change" (Troco).
- **Acceptance Criteria 5:** Upon finalization:
    - Appointment status changes to "Done".
    - Sale status changes to "Paid".
    - Product stock is automatically decremented.
    - Financial transaction is recorded for the current Tenant.

### 3.4. Multi-Tenant Isolation (Critical)
**User Story:** As a System, I must ensure valid data isolation so that one salon cannot see another's data.
- **Acceptance Criteria 1:** A user logged in to Tenant A MUST NOT see Clients, Appointments, or Sales from Tenant B.
- **Acceptance Criteria 2:** Any database insertion MUST automatically include the `tenant_id` of the authenticated user.
- **Acceptance Criteria 3:** File uploads (Client Photos) must be stored in tenant-specific folders.

## 4. Functional Requirements

### 4.1. Inventory Logic
- **Stock Movement:** Stock is only updated via `ProductMovement` records.
- **Current Stock:** The `product.currentStock` field is a read-only cache updated by triggers/logic after every movement.
- **Low Stock:** System flags products where `currentStock <= minStock`.

### 4.2. Financial Logic
- **Pricing:** Service price can be overridden at Checkout.
- **Totals:** `Total = (Services + Products) - Discount`.
- **Debt:** "Fiado" (On Tab) creates a debit record but marks the Sale as "Pending Payment" or "Paid" depending on business logic (currently marks as Paid sale but negative Client Balance). *Clarification: System tracks debt in Client Credit Balance.*

## 5. Technical Specifications

- **Backend:** Supabase (PostgreSQL).
- **Auth:** Supabase Auth (SSR).
- **Security:** Row Level Security (RLS) policies enabled on all tables.
- **ID Format:** UUID (v4) for all entities.
- **Frontend Stack:** Next.js 15, TypeScript, Tailwind CSS.

## 6. Assumptions & Constraints
- Users must be authenticated to access any part of the system (except Login/Signup).
- The system defaults to Portuguese (BRL currency, DD/MM/YYYY dates).
- Offline mode is NOT supported (requires active internet connection).
