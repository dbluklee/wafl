# Restaurant POS App(BurnanaPOS) Functional Specification (MVP)

## App Overview

- Objective: Place/Table configuration and real-time order status monitoring for restaurants Target: Owners, managers, and staff of small-to-medium-sized restaurants 
- Core Value: A basic POS system with an intuitive UI that anyone can easily use MVP Scope: Management (Place/Table Management) + Dashboard (Monitoring)

1. Welcome
    
    1.1 Figma UI Full Replication

    - Top Priority: Use the Figma MCP server to implement the design to be 100% identical.
    - Logos, welcome messages, and Sign Up/Sign In buttons must all match.

2. Authentication Page

    2.1 Development Direction
    - UI Reference: Claude Code to generate with the same tone and manner as other pages developed in Figma 
    - Function: Enter the main homepage with a dummy login

    2.2 Sign Up (Membership Registration)
    - Information to collect (DB server save):
        - Business Registration Number
        - Trade Name
        - Representative's Name
        - Representative's Contact (dummy phone authentication)
        - Email
        - Store Address
        - Naver Store Link (collect link only, no scraping function)

    2.3 Sign In (Login) - Dummy Implementation
    - Phone authentication or store number input
    - Without actual authentication, pressing the phone authentication request button will move you to the main homepage.

3. Main Homepage (Bento Grid)

    3.1 MVP Scope Feature Blocks
    - Development Targets (large blocks):
        - Management: Navigate to the Place/Table Management page
        - Dashboard: Navigate to the real-time order status monitoring page
    - Development Exclusions:
        - AI Agent block (Just create the UI, with no page links)
        - Analytics block (Just create the UI, with no page links)
        - Small blocks (POS settings, FAQ, multilingual support, email, etc.) (Just create the UI, with no page links)

    3.2 Figma UI Full Replication
    - Top Priority: Use the Figma MCP server to implement the design to be 100% identical
    - Bento grid layout, colors, typography, and spacing must all match

4. Management Page

    4.1 Figma UI-based Implementation
    - Header: Home button, current page title("Management"), current time/date (identical to Figma design)
    - Content + Panel: Dual-structure layout (implement Figma specifications exactly)

    4.2 MVP Development Tabs
    - Place: Place/Area Management (fully implemented)
    - Table: Table Management (fully implemented)
    - Category, Menu: Just create the UI, with no page links

    4.3 Place Management (Identical to Figma UI)
    - Add Place
        - "+" button → Place Settings in the Panel
        - Name input field: "eg. 1st Floor" (identical to Figma styling)
        - Color selection: 8-color palette (identical to Figma colors/layout)
        - SAVE/CANCEL buttons: Exact replication of Figma button styles
    - Place Card:
        - Full replication of the Figma card design
        - Identical implementation of the inner shadow selection effect
        - Display "0 Tables" (linked to the actual number of tables)
    - Delete Place:
        - Delete button → "Swipe >" slide bar (identical to Figma UI)
        - Full implementation of a two-step deletion confirmation

    4.4 Table Management (Identical to Figma UI)
    - Add Table:
        - "+" button → Table Settings in the Panel
        - Name: "eg. Table 1" (identical to Figma input field style)
        - Place dropdown: List of created Places (identical to Figma dropdown style)
    - Table Card:
        - Grey empty table card (exact replication of Figma design)
        - Linked to the Place color system

    4.5 POS Log System (Identical to Figma UI)
    - Full replication of the log card design
    - Implementation of the right-side slide Undo function
    - Time display and action log format are identical to Figma

5. Dashboard Page

    5.1 Figma UI Full Replication
    - Header: Home button, current page title("Dashboard"), time/date (identical to Figma)
    - Content Header: Tab buttons, floor buttons, "+" button (identical to Figma styling)

    5.2 MVP Feature Scope
    - Development Targets:
        - Dashboard tab (fully implemented)
        - Per-Place floor buttons (linked with Management)
        - Table card grid (identical to Figma layout)
    - Development Exclusions:
        - Analytics, AI Agent tabs (Just create the UI, with no page links)
        - Table Card Information: Use Dummy Data
        - "+" button : You can add to favorites by pressing the + button. (Just create the UI, with no page links)

    5.3 Table Card System (Identical to Figma Design)
    - Empty Table:
        - Grey card (exact application of Figma colors)
        - Only displays Place name and Table name
    - Dummy Order Data Card:
        - Applies the color from the Place settings
        - Displays complete order information with dummy data: PlaceName, TableName, NumberOfPeople, StayingTime, menu list (e.g., Pasta 1, Salad 1), TotalQty, TotalPrice

    5.4 Dummy Data Scenario
    - Some tables are empty (grey)
    - Some tables are in an ordering state (dummy order data)

## Development Priority & Technical Requirements

1. MVP Development Phases
    - Phase 1: Figma UI Full Replication
        - Welcome Page 
        - Authentication Page (dummy authentication)
        - Main Homepage (only Management/Dashboard active)
    - Phase 2: Management Full Implementation
        - Place management (create/edit/delete/log/undo)
        - Table management (create/edit/delete/log/undo)
    - Phase 3: Dashboard Implementation
        - Link to Management data
        - Display dummy order data
        - Simulate real-time status

2. Core Technical Requirements
    - Figma MCP server is essential: Must reference Figma design for all UI elements
    - State Management: Management ↔ Dashboard data synchronization
    - Responsive: Optimized for tablet screens

3. Excluded Features
    - Naver menu scraping
    - Actual phone authentication
    - QR order system linkage
    - AI Agent functionality
    - Analytics functionality
    - Auxiliary feature blocks

## Claude Code Development Guide

1. Essential Directives
    - Use Figma MCP Server: Must reference Figma design for all UI implementations
    - Component-based development: Build independent components for each page
    - Use dummy data: Implement full functionality with local data without actual external APIs
    - State Management: Use React useState/useContext to manage the overall app state

2. Key UI Implementation Points
    - 100% match Figma's colors, typography, spacing, and component styles
    - Accurate implementation of animation effects (inner shadow, slide, etc.)
    - Buttons, input fields, cards, and all other UI elements must be identical to Figma

## Technology Stack (For Server Deployment)

1. Backend
    - Node.js + Express + TypeScript
        - Provide CRUD for Place/Table with RESTful API
        - Dummy order data API endpoint
        - Log system API (create/retrieve/undo)
    - Database: PostgreSQL
        - Place, Table, Log table structure
        - Store dummy order data
        - Easy deployment with Docker containers
    - API Structure:
        - GET/POST /api/places
        - PUT/DELETE /api/places/:id
        - GET/POST /api/tables
        - PUT/DELETE /api/tables/:id
        - GET/POST /api/logs
        - POST /api/logs/:id/undo
        - GET /api/orders (dummy order data)

2. Frontend
    - React + TypeScript + Vite
        - Implement UI by linking with the Figma MCP server
        - Manage server data via API calls
        - Backend serves static files after build
    - State Management: React Query + Zustand
        - React Query: Server data caching and synchronization
        - Zustand: Local UI state management
    - Networking: Axios
        - Centralized API call management
        - Error handling and interceptor setup

3. Deployment Workflow
    - Local Development:
        1. Develop on MacBook 
        2. Simultaneous API and frontend development
        3. Implement UI with Figma MCP server
    - Demonstration Deployment:
        1. Docker deployment on the company server
        2. Automatic DB initialization and dummy data insertion
        3. Access http://company_server_IP on a tablet

