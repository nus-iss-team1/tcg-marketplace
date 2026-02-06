# Browser Testing Checklist

Manual testing checklist for the TCG Marketplace frontend application.

## Prerequisites

- ✅ Backend running on http://localhost:3000
- ✅ Frontend running on http://localhost:3001
- ✅ AWS resources deployed (S3 + DynamoDB)
- ✅ Test data available in DynamoDB

## Test Environment

- **Browser**: Chrome, Firefox, Safari, Edge
- **Screen Sizes**: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- **Network**: Fast 3G, Slow 3G, Offline

---

## Home Page Tests

### Layout & Design
- [ ] Header displays correctly with logo and navigation
- [ ] Hero section is visible and properly styled
- [ ] Listings grid displays in responsive columns
- [ ] Footer is visible at bottom of page
- [ ] All images load correctly
- [ ] No layout shifts during page load

### Listings Grid
- [ ] Listings load from backend API
- [ ] Loading skeleton appears while fetching
- [ ] Cards display with correct information (title, price, category)
- [ ] Price formatting is correct (USD currency)
- [ ] Category badges display correctly
- [ ] Hover effects work on cards
- [ ] Heart icon appears on hover
- [ ] Grid is responsive (4 cols → 3 cols → 2 cols → 1 col)

### Error Handling
- [ ] If backend is down, sample data displays
- [ ] Warning banner shows when using sample data
- [ ] "Try Again" button works to retry fetch
- [ ] Empty state shows when no listings exist

### Navigation
- [ ] "Sell" button in header navigates to /sell
- [ ] Logo/title navigates back to home page
- [ ] Browser back button works correctly

---

## Sell Page Tests

### Form Layout
- [ ] Form displays with all required fields
- [ ] Labels are clear and have icons
- [ ] Input fields are properly styled
- [ ] Required fields are marked with asterisk
- [ ] Form is responsive on mobile devices

### Form Validation
- [ ] Title field is required
- [ ] Price field is required and accepts numbers only
- [ ] Price accepts decimal values (e.g., 99.99)
- [ ] Category dropdown is required
- [ ] Category options display correctly
- [ ] Form cannot be submitted with missing required fields
- [ ] Browser validation messages appear

### Image Upload
- [ ] Upload area displays with drag-and-drop zone
- [ ] Click to upload opens file picker
- [ ] Multiple images can be selected
- [ ] Maximum 5 images enforced
- [ ] Image previews display after selection
- [ ] Remove button (X) works on each image
- [ ] Only image files are accepted (PNG, JPG, GIF)
- [ ] File size limit enforced (10MB)

### Form Submission
- [ ] "Create Listing" button is enabled when form is valid
- [ ] Button shows loading state during submission
- [ ] Button is disabled during submission
- [ ] Success message displays after creation
- [ ] Form resets after successful submission
- [ ] "Create Another Listing" button works

### Error Handling
- [ ] Error message displays if backend is unreachable
- [ ] Error message displays if API returns error
- [ ] Form remains filled if submission fails
- [ ] User can retry submission after error

---

## Responsive Design Tests

### Desktop (1920x1080)
- [ ] Full navigation menu visible
- [ ] Listings grid shows 4 columns
- [ ] Form fields are wide and easy to use
- [ ] Images are high quality
- [ ] No horizontal scrolling

### Tablet (768x1024)
- [ ] Navigation adapts to tablet size
- [ ] Listings grid shows 2-3 columns
- [ ] Form is still usable
- [ ] Touch targets are large enough
- [ ] Images scale appropriately

### Mobile (375x667)
- [ ] Navigation collapses to hamburger menu (if implemented)
- [ ] Listings grid shows 1 column
- [ ] Form fields stack vertically
- [ ] Buttons are full width
- [ ] Text is readable without zooming
- [ ] Touch targets are at least 44x44px
- [ ] No horizontal scrolling

---

## Performance Tests

### Page Load
- [ ] Home page loads in < 3 seconds
- [ ] Sell page loads in < 2 seconds
- [ ] Images load progressively
- [ ] No blocking resources
- [ ] Lighthouse score > 90

### API Calls
- [ ] Listings fetch completes in < 1 second
- [ ] Create listing completes in < 2 seconds
- [ ] Presigned URL generation completes in < 500ms
- [ ] No unnecessary API calls
- [ ] Loading states prevent duplicate requests

### Network Conditions
- [ ] App works on Fast 3G
- [ ] App degrades gracefully on Slow 3G
- [ ] Offline state is handled (shows error)
- [ ] Retry mechanism works after reconnection

---

## Accessibility Tests

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Enter key submits forms
- [ ] Escape key closes modals (if any)

### Screen Reader
- [ ] Page title is descriptive
- [ ] Headings are properly structured (h1, h2, h3)
- [ ] Form labels are associated with inputs
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] Images have alt text

### Color & Contrast
- [ ] Text has sufficient contrast (WCAG AA)
- [ ] Links are distinguishable from text
- [ ] Focus indicators are visible
- [ ] Color is not the only indicator of state

### ARIA
- [ ] Loading states have aria-live regions
- [ ] Buttons have descriptive aria-labels
- [ ] Form errors have aria-describedby
- [ ] Required fields have aria-required

---

## Browser Compatibility

### Chrome (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Styling is correct
- [ ] Performance is good

### Firefox (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Styling is correct
- [ ] Performance is good

### Safari (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Styling is correct
- [ ] Performance is good

### Edge (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Styling is correct
- [ ] Performance is good

---

## Integration Tests

### Backend Communication
- [ ] Frontend fetches listings from backend
- [ ] Frontend creates listings via backend API
- [ ] Frontend requests presigned URLs from backend
- [ ] CORS headers allow frontend origin
- [ ] API errors are handled gracefully

### S3 Integration
- [ ] Images upload to S3 via presigned URLs
- [ ] Uploaded images are accessible
- [ ] Image URLs are stored in listings
- [ ] Image upload errors are handled

### DynamoDB Integration
- [ ] Created listings appear in database
- [ ] Listings can be queried by category
- [ ] Listing data is correctly formatted
- [ ] Timestamps are accurate

---

## Security Tests

### Input Validation
- [ ] XSS attempts are prevented
- [ ] SQL injection attempts are prevented (backend)
- [ ] File upload restrictions are enforced
- [ ] Price cannot be negative
- [ ] Title length is limited

### CORS
- [ ] Only allowed origins can access API
- [ ] Credentials are not exposed
- [ ] Preflight requests work correctly

### Data Privacy
- [ ] No sensitive data in URLs
- [ ] No sensitive data in console logs
- [ ] No sensitive data in error messages

---

## User Experience Tests

### First-Time User
- [ ] Purpose of site is immediately clear
- [ ] Navigation is intuitive
- [ ] Call-to-action buttons are prominent
- [ ] Help text is available where needed

### Returning User
- [ ] Listings are up-to-date
- [ ] Previously created listings are visible
- [ ] Navigation is consistent
- [ ] Performance is consistent

### Error Recovery
- [ ] Users can recover from errors
- [ ] Error messages are helpful
- [ ] Retry mechanisms work
- [ ] No data loss on error

---

## Edge Cases

### Empty States
- [ ] No listings: Shows appropriate message
- [ ] No images: Form still submits
- [ ] No description: Listing still creates

### Boundary Values
- [ ] Price = 0: Handled correctly
- [ ] Price = 999999: Handled correctly
- [ ] Title = 1 character: Handled correctly
- [ ] Title = 200 characters: Handled correctly
- [ ] 5 images: All upload correctly
- [ ] 6 images: Only 5 are kept

### Concurrent Actions
- [ ] Multiple form submissions are prevented
- [ ] Multiple image uploads work correctly
- [ ] Rapid navigation doesn't break state

---

## Test Results

### Test Session Information
- **Date**: _______________
- **Tester**: _______________
- **Browser**: _______________
- **Screen Size**: _______________
- **Backend Version**: _______________
- **Frontend Version**: _______________

### Summary
- **Total Tests**: _______________
- **Passed**: _______________
- **Failed**: _______________
- **Blocked**: _______________

### Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Notes
_______________________________________________
_______________________________________________
_______________________________________________
