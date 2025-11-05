# Teacher Grading System - Complete Test Guide

## 🎯 System Overview

Complete grading system for teachers with:
- ✅ View all assignments
- ✅ See submission counts
- ✅ Review individual submissions
- ✅ Grade with feedback
- ✅ Edit existing grades
- ✅ Automatic student notifications
- ✅ Real-time statistics

## 🚀 Quick Start

### Servers Status:
- Backend: `http://localhost:5000` ✅
- Frontend: `http://localhost:5174` ✅

### Test Credentials:
```
Teacher:
Email: teacher01@datams.edu
Password: Teach@2025

Students:
Email: student01@datams.edu
Password: Stud@2025

Email: student02@datams.edu
Password: Stud@2025
```

## 📝 Complete Testing Workflow

### Step 1: Setup - Student Submits Assignment

1. **Login as Student**
   ```
   URL: http://localhost:5174
   Email: student01@datams.edu
   Password: Stud@2025
   Role: student
   ```

2. **Submit Assignment**
   - Go to: `/test/assignments`
   - Find assignment with "Pending" status
   - Click "Test Submit" button
   - Assignment submits automatically with test data

3. **Verify Submission**
   - ✅ Status changes to "Submitted"
   - ✅ Success message appears
   - ✅ Timestamp shows

4. **Repeat for Multiple Students** (Optional)
   - Logout
   - Login as student02@datams.edu
   - Submit same assignment
   - This creates multiple submissions for testing

### Step 2: Teacher Views Submissions

1. **Logout from Student Account**
   - Click profile → Logout

2. **Login as Teacher**
   ```
   Email: teacher01@datams.edu
   Password: Teach@2025
   Role: teacher
   ```

3. **Navigate to Assignments**
   - Click "Assignments" in sidebar
   - OR go to: `http://localhost:5174/assignments`

4. **Verify Dashboard**
   - ✅ See list of all assignments
   - ✅ See submission counts
   - ✅ See course names
   - ✅ See due dates

### Step 3: Review Submissions

1. **Open Assignment Details**
   - Click "View Submissions" on any assignment
   - Should see detailed view

2. **Verify Submission Details**
   - ✅ Student name visible
   - ✅ Roll number visible
   - ✅ Email visible
   - ✅ Submission content visible
   - ✅ File name (if uploaded)
   - ✅ Submission timestamp
   - ✅ Status badge (Pending Review)

3. **Check Statistics**
   - ✅ Total submissions count
   - ✅ Graded count
   - ✅ Pending count
   - ✅ Max points display

### Step 4: Grade Submission

1. **Click "Grade" Button**
   - On any pending submission
   - Grading modal opens

2. **Review Submission in Modal**
   - ✅ Student name at top
   - ✅ Submission content visible
   - ✅ File attachment shown (if any)

3. **Enter Grade**
   - Type grade value (e.g., 85)
   - Must be between 0 and max_points
   - Percentage auto-calculates

4. **Enter Feedback** (Optional but Recommended)
   ```
   Example feedback:
   "Great work! Your solution is well-structured and demonstrates good understanding of the concepts. Consider adding more comments to explain your logic. Keep it up!"
   ```

5. **Submit Grade**
   - Click "Submit Grade" button
   - Wait for success message

6. **Verify Grading**
   - ✅ Success toast appears
   - ✅ Modal closes
   - ✅ Submission status changes to "Graded"
   - ✅ Grade displays on card
   - ✅ Feedback visible
   - ✅ Graded timestamp shows

### Step 5: Edit Grade (Optional)

1. **Click "Edit Grade"**
   - On already graded submission
   - Modal opens with existing grade/feedback

2. **Modify Grade or Feedback**
   - Change grade value
   - Update feedback text

3. **Submit Changes**
   - Click "Update Grade"
   - Verify changes saved

### Step 6: Student Receives Notification

1. **Logout from Teacher Account**

2. **Login as Student**
   ```
   Email: student01@datams.edu
   Password: Stud@2025
   ```

3. **Check Notifications**
   - Click bell icon (🔔) in top right
   - Should see "Assignment Graded" notification

4. **Verify Notification Content**
   - ✅ Assignment title shown
   - ✅ Grade shown (e.g., 85/100)
   - ✅ Percentage shown (e.g., 85.0%)
   - ✅ Notification type (success/warning/error based on grade)

5. **View Grade in Assignments**
   - Go to Assignments page
   - Assignment status should be "Graded"
   - Grade visible
   - Feedback visible

## 🧪 Advanced Testing

### Test Case 1: Grade Validation

1. **Try Invalid Grades**
   - Enter negative number → Should show error
   - Enter value > max_points → Should show error
   - Enter non-numeric value → Should show error
   - Leave empty → Submit button disabled

2. **Verify Error Messages**
   - ✅ Clear error message shown
   - ✅ Grade not submitted
   - ✅ Modal stays open

### Test Case 2: Multiple Submissions

1. **Submit from Multiple Students**
   - student01, student02, student03
   - All submit same assignment

2. **Grade All Submissions**
   - Give different grades
   - Provide different feedback
   - Verify each saves correctly

3. **Check Statistics Update**
   - ✅ Total count increases
   - ✅ Graded count increases
   - ✅ Pending count decreases
   - ✅ Average grade calculates correctly

### Test Case 3: Notification System

1. **Submit Assignment as Student**
   - Verify teacher gets notification

2. **Grade Assignment as Teacher**
   - Verify student gets notification

3. **Check Notification Details**
   - ✅ Correct title
   - ✅ Correct message
   - ✅ Correct link
   - ✅ Correct type (color)

### Test Case 4: Real-time Updates

1. **Open Assignment Details**
   - Note current statistics

2. **Grade a Submission**
   - Statistics should update immediately
   - No page refresh needed

3. **Verify Updates**
   - ✅ Graded count increases
   - ✅ Pending count decreases
   - ✅ Average grade updates
   - ✅ Status badge changes

## ✅ Success Checklist

### Teacher Features:
- [ ] Can login as teacher
- [ ] Can view all assignments
- [ ] Can see submission counts
- [ ] Can view individual submissions
- [ ] Can see student details
- [ ] Can see submission content
- [ ] Can see submission files
- [ ] Can grade submissions
- [ ] Can provide feedback
- [ ] Can edit grades
- [ ] Can see statistics
- [ ] Receives submission notifications

### Student Features:
- [ ] Can submit assignments
- [ ] Receives grade notifications
- [ ] Can view grades
- [ ] Can view feedback
- [ ] Status updates correctly

### System Features:
- [ ] Real-time updates work
- [ ] Validation works correctly
- [ ] Error handling works
- [ ] Toast notifications work
- [ ] No console errors
- [ ] UI is responsive
- [ ] All buttons work
- [ ] Modals open/close properly

## 🔧 Troubleshooting

### Issue: Grading Modal Doesn't Open
**Solution:**
- Check browser console for errors
- Verify submission has valid _id
- Refresh page and try again

### Issue: Grade Not Saving
**Solution:**
- Check if grade is valid number
- Verify grade is within 0 to max_points
- Check backend is running
- Check Network tab for API errors

### Issue: Notification Not Appearing
**Solution:**
- Refresh page
- Click bell icon to open notifications panel
- Check if backend notification route is working
- Verify user_id is correct

### Issue: Statistics Not Updating
**Solution:**
- Click refresh button
- Close and reopen assignment details
- Check if submissions are loading correctly

## 📊 Expected Results

### After Grading:
```
Submission Card Should Show:
- ✅ Status: "Graded" (green badge)
- ✅ Grade: "85/100" (with percentage)
- ✅ Feedback: Full text visible
- ✅ Graded timestamp
- ✅ "Edit Grade" button (instead of "Grade")
```

### Statistics Should Show:
```
- Total Submissions: X
- Graded: Y (increases after grading)
- Pending: Z (decreases after grading)
- Avg Grade: Calculated average
```

### Student Notification Should Show:
```
Title: "Assignment Graded"
Message: "Your assignment '[Title]' has been graded. Score: 85/100 (85.0%)"
Type: success (green) if ≥70%, warning (yellow) if ≥50%, error (red) if <50%
```

## 🎉 Success Criteria

System is working perfectly if:
1. ✅ Teacher can view all assignments
2. ✅ Teacher can see all submissions
3. ✅ Teacher can grade with feedback
4. ✅ Teacher can edit grades
5. ✅ Student receives notifications
6. ✅ Statistics update in real-time
7. ✅ Validation works correctly
8. ✅ No errors in console
9. ✅ UI is smooth and responsive
10. ✅ All features work end-to-end

## 📞 Support

If issues persist:
1. Check both servers are running
2. Clear browser cache
3. Check MongoDB is running
4. Review browser console (F12)
5. Check Network tab for API errors
6. Verify test credentials are correct

---

**Ready to Test!** 🚀 Start from Step 1 above.