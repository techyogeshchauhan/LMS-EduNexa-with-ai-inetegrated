# Super Admin Simplification Requirements

## Introduction

This specification defines the requirements for simplifying the super admin functionality in the EduNexa LMS system. The current super admin interface has extensive features that need to be reduced to essential functionality only, while ensuring the sidebar navigation is properly fixed and streamlined.

## Glossary

- **Super Admin**: The highest level administrator with system-wide access and control
- **EduNexa LMS**: The Learning Management System being modified
- **Sidebar**: The left navigation panel containing menu items and navigation links
- **Essential Functionality**: Core administrative features required for basic system management
- **User Management**: The ability to view, create, edit, and manage system users

## Requirements

### Requirement 1

**User Story:** As a super admin, I want a simplified dashboard with only essential controls, so that I can focus on core administrative tasks without being overwhelmed by complex features.

#### Acceptance Criteria

1. WHEN the super admin logs in, THE EduNexa LMS SHALL display a simplified dashboard with only essential statistics
2. THE EduNexa LMS SHALL show only user count, system status, and basic analytics on the dashboard
3. THE EduNexa LMS SHALL remove all advanced system controls like emergency stops, database controls, and revenue management
4. THE EduNexa LMS SHALL maintain a clean and minimal interface design
5. THE EduNexa LMS SHALL display only actionable items that are frequently used

### Requirement 2

**User Story:** As a super admin, I want a streamlined sidebar with minimal navigation options, so that I can quickly access the most important administrative functions.

#### Acceptance Criteria

1. THE EduNexa LMS SHALL display only essential navigation items in the sidebar
2. THE EduNexa LMS SHALL include Dashboard, User Management, and Settings in the sidebar navigation
3. THE EduNexa LMS SHALL remove all complex categories like AI Control Center, System Automation, and Billing
4. THE EduNexa LMS SHALL maintain proper sidebar collapse/expand functionality
5. THE EduNexa LMS SHALL ensure all sidebar links navigate correctly to their respective pages

### Requirement 3

**User Story:** As a super admin, I want functional user management capabilities, so that I can manage system users effectively.

#### Acceptance Criteria

1. THE EduNexa LMS SHALL provide a user management interface accessible from the sidebar
2. WHEN accessing user management, THE EduNexa LMS SHALL display a list of all system users
3. THE EduNexa LMS SHALL allow viewing user details and basic information
4. THE EduNexa LMS SHALL support user role management (student, teacher, admin)
5. THE EduNexa LMS SHALL ensure the user management interface is responsive and functional

### Requirement 4

**User Story:** As a super admin, I want a working settings page, so that I can configure basic system parameters.

#### Acceptance Criteria

1. THE EduNexa LMS SHALL provide a settings interface accessible from the sidebar
2. THE EduNexa LMS SHALL allow configuration of basic system settings
3. THE EduNexa LMS SHALL include profile management options for the super admin
4. THE EduNexa LMS SHALL ensure all settings changes are properly saved
5. THE EduNexa LMS SHALL maintain a simple and intuitive settings interface

### Requirement 5

**User Story:** As a super admin, I want all navigation and functionality to work properly, so that I can perform administrative tasks without encountering broken features.

#### Acceptance Criteria

1. THE EduNexa LMS SHALL ensure all sidebar navigation links work correctly
2. THE EduNexa LMS SHALL remove or fix any broken navigation items
3. THE EduNexa LMS SHALL ensure proper routing between different admin pages
4. THE EduNexa LMS SHALL maintain consistent styling and layout across all pages
5. THE EduNexa LMS SHALL ensure the sidebar toggle functionality works properly