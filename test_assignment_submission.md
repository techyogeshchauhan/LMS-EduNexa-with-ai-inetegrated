# Assignment Submission Test Guide

## Test Steps:

### 1. Login as Student
- Open browser and go to http://localhost:5175
- Login with student credentials:
  - Email: student01@datams.edu
  - Password: Stud@2025
  - Role: student

### 2. Navigate to Course Details
- Go to Courses page
- Click on any course to view details
- Click on "Assignments" tab

### 3. Test Assignment Submission
- Find an assignment with "Not Submitted" status
- Click "Submit" button
- Fill in the submission form:
  - Add text content in the text area
  - Optionally upload a file
- Click "Submit Assignment"

### 4. Verify Submission
- Check that success toast appears
- Verify assignment status changes to "Submitted"
- Check that submit button changes to "View"

### 5. Test Error Cases
- Try submitting without any content (should show validation error)
- Try submitting the same assignment again (should show error)

## Expected Results:
- ✅ Assignment submission should work smoothly
- ✅ Status should update from "pending" to "submitted"
- ✅ Success/error messages should display properly
- ✅ Form should reset after successful submission
- ✅ Modal should close after submission

## Backend API Endpoints Used:
- GET /api/assignments/ - Fetch assignments
- POST /api/assignments/{id}/submit - Submit assignment

## Database Collections Updated:
- submissions - New submission record created
- users - Student's total_points updated (after grading)