# MNIT Laundry Management System - System Diagram

## 1. Overall System Architecture

```mermaid
graph TD
    A[Landing Page] --> B[Login]
    A --> C[Register]
    B --> D[Dashboard]
    C --> D
    D --> E[Machines]
    D --> F[Bookings]
    D --> G[Staff Dashboard]
    D --> H[Admin Dashboard]
    D --> I[User Management]
    D --> J[Settings]
    D --> K[Logout]
```

## 2. User Roles and Permissions

```mermaid
graph TD
    A[User Roles] --> B[Student]
    A --> C[Staff]
    A --> D[Admin]
    
    B --> B1[View Machines]
    B --> B2[Book Machines]
    B --> B3[View Bookings]
    B --> B4[Cancel Bookings]
    
    C --> C1[View All Machines]
    C --> C2[Update Machine Status]
    C --> C3[View All Bookings]
    C --> C4[Manage Bookings]
    
    D --> D1[All Student Permissions]
    D --> D2[All Staff Permissions]
    D --> D3[User Management]
    D --> D4[System Configuration]
    D --> D5[Reports & Analytics]
```

## 3. Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant LandingPage
    participant Login
    participant Register
    participant AuthContext
    participant Dashboard
    
    User->>LandingPage: Visit
    LandingPage->>User: Display options
    
    alt Login Flow
        User->>Login: Click Login
        Login->>User: Display login form
        User->>Login: Enter credentials
        Login->>AuthContext: Submit credentials
        AuthContext->>AuthContext: Validate
        AuthContext->>Dashboard: Redirect if valid
        AuthContext->>Login: Show error if invalid
    else Registration Flow
        User->>Register: Click Register
        Register->>User: Display registration form
        User->>Register: Complete form
        Register->>AuthContext: Submit registration
        AuthContext->>AuthContext: Process registration
        AuthContext->>Dashboard: Redirect if successful
        AuthContext->>Register: Show error if failed
    end
```

## 4. Component Structure

```mermaid
graph TD
    A[App] --> B[AuthLayout]
    A --> C[MainLayout]
    A --> D[ProtectedRoute]
    
    B --> B1[Login]
    B --> B2[Register]
    
    C --> C1[Dashboard]
    C --> C2[Machines]
    C --> C3[Bookings]
    C --> C4[Staff Dashboard]
    C --> C5[Admin Dashboard]
    C --> C6[User Management]
    
    D --> D1[Role Check]
    D --> D2[Authentication Check]
```

## 5. Data Flow

```mermaid
graph LR
    A[User Interface] --> B[React Components]
    B --> C[Context API]
    C --> D[API Service]
    D --> E[Backend API]
    E --> F[Database]
    
    F --> E
    E --> D
    D --> C
    C --> B
    B --> A
```

## 6. Navigation Flow

```mermaid
stateDiagram-v2
    [*] --> LandingPage
    LandingPage --> Login
    LandingPage --> Register
    Login --> Dashboard
    Register --> Dashboard
    Dashboard --> Machines
    Dashboard --> Bookings
    Dashboard --> StaffDashboard
    Dashboard --> AdminDashboard
    Dashboard --> UserManagement
    Dashboard --> Settings
    Dashboard --> Logout
    Logout --> LandingPage
```

## 7. Registration Process

```mermaid
graph TD
    A[Start Registration] --> B[Step 1: Account Information]
    B --> C[Step 2: Personal Details]
    C --> D[Step 3: Confirmation]
    D --> E[Submit Registration]
    E --> F[Success]
    E --> G[Error]
    F --> H[Dashboard]
    G --> B
```

## 8. Booking Process

```mermaid
graph TD
    A[View Machines] --> B[Select Machine]
    B --> C[Choose Time Slot]
    C --> D[Confirm Booking]
    D --> E[Payment]
    E --> F[Booking Confirmed]
    F --> G[View Booking]
```

## 9. System Components

```mermaid
graph TD
    A[Frontend] --> B[React]
    B --> C[Material-UI]
    B --> D[React Router]
    B --> E[Context API]
    
    F[Backend] --> G[API Endpoints]
    G --> H[Authentication]
    G --> I[User Management]
    G --> J[Machine Management]
    G --> K[Booking Management]
    
    L[Database] --> M[User Data]
    L --> N[Machine Data]
    L --> O[Booking Data]
    L --> P[System Configuration]
``` 