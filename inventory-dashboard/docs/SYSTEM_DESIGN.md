# System Design Document: Intelligent Inventory Dashboard

**Version:** 1.0  
**Date:** August 2026  
**Author:** Dinh Hoang (SWE)  
**Project:** Keyloop Coding Challenge - Scenario B

---

## Executive Summary

The Intelligent Inventory Dashboard is a web-based application designed to provide dealership managers with real-time insights into their vehicle inventory. The system emphasizes aging stock identification and actionable decision-making, enabling managers to reduce inventory holding costs and optimize sales strategies.

### Key Features
- **Real-time Inventory Visualization** with advanced filtering
- **Automated Aging Stock Detection** (vehicles >90 days)
- **Action Logging System** for manager interventions
- **Responsive, Accessible UI** with Angular Material
- **Comprehensive Observability** for monitoring and debugging

---

## 1. Architecture Overview

### 1.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Browser)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │   Dashboard    │  │   Filter Panel   │  │  Aging Stock   │  │
│  │   Component    │  │   Component      │  │  Alert         │  │
│  └────────┬───────┘  └────────┬─────────┘  └────────┬───────┘  │
│           │                   │                      │          │
│           └───────────────────┼──────────────────────┘          │
│                               │                                 │
│  ┌────────────────────────────┼────────────────────────────┐   │
│  │        PRESENTATION LAYER (Angular Components)          │   │
│  │                            │                            │   │
│  │  ┌─────────────────────────▼──────────────────────┐    │   │
│  │  │         Inventory List Component               │    │   │
│  │  │  - Material Table with Sorting & Pagination    │    │   │
│  │  │  - Color-coded Aging Indicators                │    │   │
│  │  │  - Action Dialog Trigger                       │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────   │
│                               │                                 │
│  ┌────────────────────────────▼────────────────────────────┐   │
│  │           SERVICE LAYER (Business Logic)               │   │
│  │                                                         │   │
│  │  ┌──────────────────┐  ┌──────────────────────────┐   │   │
│  │  │  Inventory       │  │  Logging Service         │   │   │
│  │  │  Service         │  │  - Structured Logs       │   │   │
│  │  │  - Filter Logic  │  │  - Console Output        │   │   │
│  │  │  - Aging Calc    │  │  - Error Tracking        │   │   │
│  │  │  - CRUD Ops      │  └──────────────────────────┘   │   │
│  │  └────────┬─────────┘                                  │   │
│  └───────────┼────────────────────────────────────────────┘   │
│              │                                                 │
│  ┌───────────▼─────────────────────────────────────────────┐  │
│  │        HTTP INTERCEPTOR (Observability)                 │  │
│  │  - Request/Response Logging                             │  │
│  │  - Performance Timing                                   │  │
│  │  - Error Capture                                        │  │
│  └───────────┬─────────────────────────────────────────────┘  │
│              │ HTTP Client                                    │
└──────────────┼────────────────────────────────────────────────┘
               │
               │ REST API Calls
               │
┌──────────────▼────────────────────────────────────────────────┐
│                    MOCK DATA LAYER                            │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  JSON Server (http://localhost:3000)                  │   │
│  │  - GET    /vehicles          (list all vehicles)      │   │
│  │  - GET    /vehicles/:id      (get vehicle by ID)      │   │
│  │  - GET    /actionLogs        (list all actions)       │   │
│  │  - POST   /actionLogs        (create action log)      │   │
│  │  - PATCH  /actionLogs/:id    (update action log)      │   │
│  │  - DELETE /actionLogs/:id    (delete action log)      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  db.json (Persistent Mock Database)                   │   │
│  │  - vehicles[] (50 sample vehicles)                    │   │
│  │  - actionLogs[] (manager actions)                     │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                   PRODUCTION ARCHITECTURE                      │
│                    (Future Implementation)                     │
├────────────────────────────────────────────────────────────────┤
│  Frontend → API Gateway → Microservices:                      │
│    - Inventory Service (Vehicle data)                         │
│    - Action Log Service (Manager actions)                     │
│    - Analytics Service (Reporting & metrics)                  │
│  Backend → PostgreSQL / MongoDB                               │
│  Observability → DataDog / New Relic                          │
└────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| **Frontend Framework** | Angular | 18.2 | Mature enterprise framework with strong TypeScript support, built-in dependency injection, and excellent tooling |
| **UI Components** | Angular Material | 18.2 | Professional, accessible components following Material Design principles; reduces custom CSS |
| **State Management** | RxJS + Services | 7.8 | Lightweight reactive state management; avoids complexity of NgRx for this scope |
| **HTTP Client** | Angular HttpClient | 18.2 | Native Angular HTTP client with interceptor support and observable-based API |
| **Mock Backend** | JSON Server | 1.0 | RESTful mock API with zero configuration; supports CRUD operations with file persistence |
| **Date Utilities** | date-fns | 4.4 | Lightweight, tree-shakeable date library for aging calculations |
| **Build Tool** | Angular CLI | 18.2 | Official build tool with webpack under the hood; optimized production builds |
| **Testing** | Jasmine + Karma | 5.x / 6.x | Default Angular testing framework; well-documented and integrated |
| **Language** | TypeScript | 5.5 | Type safety, better IDE support, catches errors at compile-time |

---

## 2. Component Architecture

### 2.1 Component Hierarchy

```
AppComponent (Root)
└── DashboardComponent
    ├── AgingStockAlertComponent
    ├── FilterPanelComponent
    └── InventoryListComponent
        └── ActionDialogComponent (Modal)
```

### 2.2 Component Responsibilities

#### **DashboardComponent**
- **Role**: Main container and orchestrator
- **Responsibilities**:
  - Load vehicle data on initialization
  - Manage application-level state (vehicles, filtered vehicles, aging stock)
  - Coordinate filter changes
  - Handle error states and loading indicators
- **Key Methods**:
  - `loadVehicles()`: Fetch inventory from service
  - `onFilterChange(filter)`: Apply filter and update views
  - `applyFilter(filter)`: Execute filtering logic

#### **AgingStockAlertComponent**
- **Role**: Visual alert for aging inventory
- **Responsibilities**:
  - Display count of vehicles >90 days
  - Calculate total value and average age
  - Provide actionable context to managers
- **Inputs**: `@Input() agingVehicles: Vehicle[]`
- **Features**: Pulsing animation, statistics cards, responsive design

#### **FilterPanelComponent**
- **Role**: Multi-criteria filtering interface
- **Responsibilities**:
  - Provide filter controls (make, model, year, age range, search)
  - Emit filter changes to parent
  - Maintain filter state
- **Outputs**: `@Output() filterChange: EventEmitter<VehicleFilter>`
- **Features**: Reactive forms, real-time filtering, clear filters button

#### **InventoryListComponent**
- **Role**: Tabular display of vehicles
- **Responsibilities**:
  - Render sortable, paginated table
  - Highlight aging stock with color coding
  - Open action dialog for aging vehicles
- **Inputs**: `@Input() vehicles`, `@Input() highlightAging`
- **Outputs**: `@Output() vehicleAction: EventEmitter<Vehicle>`
- **Features**: Material Table, sorting, pagination (25/50/100 per page)

#### **ActionDialogComponent**
- **Role**: Modal for logging manager actions
- **Responsibilities**:
  - Collect action type, notes, proposed date, user name
  - Validate input (min 10 characters for notes)
  - Save action log via service
  - Show success/error notifications
- **Dialog Data**: `{ vehicle: Vehicle }`
- **Features**: Form validation, date picker, snackbar notifications

---

## 3. Data Flow

### 3.1 Data Loading Flow

```
User Opens App
      ↓
DashboardComponent.ngOnInit()
      ↓
InventoryService.getVehicles()
      ↓
HTTP GET /vehicles
      ↓
HttpLoggingInterceptor (logs request)
      ↓
JSON Server responds with vehicles[]
      ↓
InventoryService.calculateDaysInStock()
      ↓
Update BehaviorSubjects (vehicles$, filteredVehicles$, agingStock$)
      ↓
Components re-render via async pipe
```

### 3.2 Filtering Flow

```
User changes filter (e.g., selects "Toyota")
      ↓
FilterPanelComponent.filterForm.valueChanges
      ↓
Emit filterChange event
      ↓
DashboardComponent.onFilterChange(filter)
      ↓
InventoryService.filterVehicles(allVehicles, filter)
      ↓
Update filteredVehicles$ and agingStock$ BehaviorSubjects
      ↓
InventoryListComponent re-renders with filtered data
```

### 3.3 Action Logging Flow

```
User clicks "Log Action" on aging vehicle
      ↓
ActionDialogComponent opens (Material Dialog)
      ↓
User fills form (action type, notes, date)
      ↓
User clicks "Save Action"
      ↓
InventoryService.createActionLog(actionLog)
      ↓
HTTP POST /actionLogs
      ↓
JSON Server persists to db.json
      ↓
Success → Snackbar notification "Action logged successfully!"
      ↓
Dialog closes
```

---

## 4. Data Models

### 4.1 Vehicle Model

```typescript
interface Vehicle {
  id: string;              // Unique identifier
  vin: string;             // Vehicle Identification Number
  make: string;            // Manufacturer (e.g., "Toyota")
  model: string;           // Model name (e.g., "Camry")
  year: number;            // Model year
  stockDate: string;       // ISO date string (when added to inventory)
  daysInStock: number;     // Calculated: current date - stockDate
  price: number;           // USD price
  status: 'available' | 'sold' | 'reserved';
  color: string;
  mileage: number;         // Odometer reading
}
```

### 4.2 ActionLog Model

```typescript
interface ActionLog {
  id: string;              // Auto-generated by JSON Server
  vehicleId: string;       // Foreign key to Vehicle
  action: ActionType;      // Selected action category
  notes: string;           // Manager's notes (min 10 chars)
  timestamp: string;       // ISO date string (auto-generated)
  user: string;            // Manager name
  proposedDate?: string;   // Optional target date for action
}

type ActionType =
  | 'Price Reduction'
  | 'Trade-In Offer'
  | 'Auction Listing'
  | 'Marketing Campaign'
  | 'Internal Transfer'
  | 'Special Promotion'
  | 'Other';
```

---

## 5. Observability Strategy

### 5.1 Logging

**LoggingService** provides centralized, structured logging:

```typescript
export enum LogLevel {
  DEBUG, INFO, WARN, ERROR
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}
```

**Log Levels Usage:**
- `DEBUG`: Development-only verbose logs (e.g., filter applied, state changes)
- `INFO`: General operational logs (e.g., vehicles loaded, action saved)
- `WARN`: Potential issues (e.g., slow API response)
- `ERROR`: Failures requiring attention (e.g., HTTP errors, validation failures)

**Production Implementation:**
- Replace console output with DataDog/Sentry/CloudWatch integration
- Add correlation IDs for request tracing
- Aggregate logs for analytics

### 5.2 HTTP Interceptor

**HttpLoggingInterceptor** tracks all HTTP requests:

```typescript
// Logs:
[INFO] HTTP GET http://localhost:3000/vehicles
[INFO] HTTP GET http://localhost:3000/vehicles completed in 125ms
[ERROR] HTTP POST http://localhost:3000/actionLogs failed after 3000ms
```

**Metrics Captured:**
- Request method, URL, headers
- Response time (milliseconds)
- Success/failure status
- Error details (stack trace, response body)

**Production Enhancements:**
- Send timing metrics to Prometheus/Grafana
- Alert on error rate thresholds
- Track slow queries (>1s)

### 5.3 Error Handling

**Strategy:**
- **Network Errors**: Display user-friendly message, log technical details
- **Validation Errors**: Show inline form errors, don't log
- **Unexpected Errors**: Global error handler → log → fallback UI

**Example:**
```typescript
this.inventoryService.getVehicles().subscribe({
  next: (vehicles) => { /* success */ },
  error: (error) => {
    this.logger.error('Failed to load vehicles', error);
    this.error = 'Failed to load inventory. Please ensure the JSON server is running.';
  }
});
```

### 5.4 Performance Monitoring

**Metrics to Track:**
- **Time to First Paint (TFP)**
- **Time to Interactive (TTI)**
- **API Response Times**: Average, p95, p99
- **Component Render Times**

**Tools (Production):**
- Google Analytics / Google Tag Manager
- Lighthouse CI (automated performance audits)
- Real User Monitoring (RUM) via DataDog/New Relic

---

## 6. Scalability Considerations

### 6.1 Frontend Scalability

**Current Implementation:**
- **In-memory filtering**: Fast for <1000 vehicles
- **Client-side pagination**: No server-side load

**Production Optimizations:**
1. **Lazy Loading**: Load modules on-demand (not needed for current size)
2. **Virtual Scrolling**: For tables with 10,000+ rows (Angular CDK)
3. **Server-side Pagination**: Fetch 50 vehicles at a time
4. **Memoization**: Cache filter results with `@memoize` decorator
5. **Service Workers**: Offline support, cache API responses

### 6.2 Backend Scalability (Production)

**Database:**
- **PostgreSQL** with indexing on `stockDate`, `make`, `model`
- **Read Replicas** for high-traffic scenarios
- **Caching Layer** (Redis) for frequently accessed data

**API:**
- **Pagination**: `GET /vehicles?page=1&limit=50`
- **Filtering**: `GET /vehicles?make=Toyota&minDays=90`
- **Rate Limiting**: 100 requests/minute per user

**Microservices:**
- **Inventory Service**: Vehicle CRUD
- **Action Log Service**: Manager actions
- **Analytics Service**: Reporting, trends

### 6.3 Load Balancing

- **Horizontal Scaling**: Deploy multiple frontend instances behind load balancer
- **CDN**: Serve static assets (JS, CSS, images) via CloudFront/Cloudflare
- **Auto-scaling**: Kubernetes-based scaling based on CPU/memory

---

## 7. Security Considerations

### 7.1 Current Implementation (Mock)

- No authentication/authorization (demo only)
- No input sanitization (trusted environment)
- No HTTPS (local development)

### 7.2 Production Requirements

**Authentication:**
- **SSO Integration**: SAML 2.0 / OAuth 2.0
- **Session Management**: JWT tokens with 1-hour expiry
- **Multi-Factor Authentication (MFA)** for manager accounts

**Authorization:**
- **Role-Based Access Control (RBAC)**:
  - `viewer`: Read-only access
  - `manager`: Can log actions
  - `admin`: Full access, can delete logs

**Data Protection:**
- **Input Validation**: Sanitize all user input (prevent XSS, SQL injection)
- **HTTPS**: Encrypt all traffic (TLS 1.3)
- **API Keys**: Rotate every 90 days
- **CORS**: Whitelist only trusted domains

**Audit Trail:**
- Log all manager actions (who, what, when)
- Immutable action logs (append-only)

---

## 8. Testing Strategy

### 8.1 Unit Tests

**InventoryService Tests:**
- Calculate days in stock correctly
- Filter by make, model, year
- Identify aging stock (>90 days)
- Handle empty datasets

**Component Tests:**
- Dashboard loads vehicles on init
- Filter panel emits correct filter object
- Aging alert displays correct count
- Inventory list highlights aging rows

### 8.2 Integration Tests (Future)

- End-to-end user flows with Cypress
- Mock API responses for reliability
- Test edge cases (network errors, slow responses)

### 8.3 Performance Tests

- Lighthouse scores (target: >90 performance)
- Load testing with 1000+ vehicles
- Stress testing with rapid filter changes

---

## 9. Future Enhancements

### 9.1 Feature Roadmap

**Phase 2: Advanced Analytics**
- Dashboard charts (inventory trends, aging stock over time)
- Predictive analytics (forecast time-to-sell)
- Export reports (CSV, PDF)

**Phase 3: Real-time Collaboration**
- WebSocket updates (multiple managers see changes instantly)
- Conflict resolution (optimistic locking)

**Phase 4: Mobile App**
- React Native / Flutter mobile app
- Push notifications for critical aging stock

**Phase 5: AI/ML Integration**
- Price optimization recommendations
- Demand forecasting
- Automated email campaigns for aging stock

---

## 10. GenAI Usage Narrative

### 10.1 How GenAI Assisted Design

**Architecture Planning:**
- Generated initial component hierarchy and data flow diagrams
- Suggested appropriate technology stack for enterprise requirements
- Provided best practices for Angular Material integration

**Design Patterns:**
- Recommended BehaviorSubjects for reactive state management
- Suggested HTTP interceptor pattern for observability
- Proposed service-based architecture for testability

**Documentation:**
- Auto-generated Mermaid diagrams for architecture visualization
- Created comprehensive interface documentation
- Drafted scalability and security sections

### 10.2 Design Validation

**Human Review:**
- Validated all architectural decisions against Angular best practices
- Ensured scalability patterns align with real-world production needs
- Verified security considerations meet industry standards

**Iterative Refinement:**
- Simplified state management (avoided over-engineering with NgRx)
- Optimized component structure for maintainability
- Added observability layer based on production experience

### 10.3 Quality Assurance

**Code Review Process:**
- Manual inspection of generated code
- Type-checking with TypeScript strict mode
- Linting with ESLint (Angular recommended rules)
- Accessibility audit (ARIA labels, keyboard navigation)

**Testing:**
- Unit tests for core business logic
- Manual testing of all user flows
- Browser compatibility testing (Chrome, Firefox, Safari)

---

## 11. Conclusion

The Intelligent Inventory Dashboard provides a **production-ready frontend** architecture with a **mock backend** that demonstrates full-stack thinking. The design prioritizes:

1. **User Experience**: Fast, intuitive, accessible
2. **Maintainability**: Clean separation of concerns, TypeScript safety
3. **Scalability**: Easily extendable to real backend and microservices
4. **Observability**: Comprehensive logging for debugging and monitoring

The system successfully fulfills all core requirements while demonstrating enterprise-grade architecture patterns suitable for real-world deployment.

---

**Document Version Control:**
- v1.0 (2026-08-08): Initial design document
