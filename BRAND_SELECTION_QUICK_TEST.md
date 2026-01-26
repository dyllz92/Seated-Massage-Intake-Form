# Brand Selection Page - Quick Testing Checklist

**Quick Test: ~5-10 minutes**

---

## Visual Check (2 min)

### Desktop (1024px+)
- [ ] Both logos visible side-by-side
- [ ] Flexion logo appears (blue)
- [ ] Hemisphere logo appears (actual company logo, not "H")
- [ ] Logos are large and clear (110-140px range)
- [ ] No brand names or subtitles visible
- [ ] Website links visible below each logo (small text)
- [ ] Links are readable
- [ ] Proper spacing between logo and link
- [ ] Cards have subtle shadows
- [ ] Layout is balanced and centered

### Mobile (375px)
- [ ] Both cards visible (stacked vertically or side-by-side)
- [ ] Logos are appropriately sized (72-96px range)
- [ ] Logos don't overflow
- [ ] Links are readable (not too small)
- [ ] Cards have proper spacing
- [ ] No horizontal scrolling
- [ ] Layout looks balanced

---

## Functionality Check (3 min)

### Selection
- [ ] Click "Flexion" logo → navigates to form
- [ ] Click "Hemisphere" logo → navigates to form
- [ ] Selected brand is remembered (check localStorage)

### Links
- [ ] Click "flexionandflow.com.au" → opens in new tab
- [ ] Click "hemispherewellness.com" → opens in new tab
- [ ] Form doesn't close when clicking links

### Interaction
- [ ] Hover card → subtle visual feedback
- [ ] Click card → scale-down effect visible
- [ ] Link text changes color on hover
- [ ] Smooth transitions (no jarring)

---

## Keyboard Navigation (2 min)

### Tab Navigation
- [ ] Tab → Flexion card focused (outline visible)
- [ ] Tab → Hemisphere card focused (outline visible)
- [ ] Tab → Flexion link focused (outline visible)
- [ ] Tab → Hemisphere link focused (outline visible)

### Selection
- [ ] Enter on Flexion card → selects brand
- [ ] Enter on Hemisphere card → selects brand
- [ ] Space on links → opens in new tab (alternative to Tab+Enter)

---

## Accessibility Check (2 min)

### Screen Reader (Use NVDA/JAWS/VoiceOver)
- [ ] Flexion button announces "Select Flexion & Flow"
- [ ] Hemisphere button announces "Select Hemisphere Wellness"
- [ ] Links are announced as links with proper URL text

### Focus Indicators
- [ ] Focus outline clearly visible on all interactive elements
- [ ] Focus color matches theme (blue or primary color)
- [ ] No elements lose focus when scrolling

---

## Cross-Browser Quick Check (optional but recommended)

Test in at least 2 browsers:

### Chrome
- [ ] Logos render correctly
- [ ] Layouts look as expected
- [ ] Links work

### Firefox
- [ ] Logos render correctly
- [ ] Layouts look as expected
- [ ] Links work

---

## Mobile-Specific Check (1 min)

### Touch Interaction
- [ ] Touch Flexion card → selects brand
- [ ] Touch Hemisphere card → selects brand
- [ ] Touch links → opens in new tab
- [ ] Touch provides visual feedback (scale effect)

### Responsive
- [ ] At 375px: cards fit without scrolling
- [ ] At 768px: cards side-by-side with good spacing
- [ ] At 1024px: cards properly sized with desktop logos
- [ ] Logo sizes transition smoothly

---

## Acceptance Checklist

✅ **Before proceeding to full testing**, verify:

- [ ] All visual elements render correctly
- [ ] No console errors (F12 → Console)
- [ ] Brand selection still works
- [ ] Links don't interfere with selection
- [ ] Keyboard navigation works
- [ ] Mobile layout responsive
- [ ] Logos visible (not broken image icons)

---

## Issue Reporting Template

If you find an issue, note:

```
Issue: [What's wrong]
Browser: [Chrome/Firefox/Safari/etc]
Device: [Desktop/Mobile/Tablet]
Viewport: [1024px / 768px / 375px / etc]
Steps to reproduce:
  1. [First step]
  2. [Second step]
  3. [Expected result vs Actual result]
Screenshot: [if possible]
```

---

## Quick Fixes Reference

| Issue | Solution |
|-------|----------|
| Logos not showing | Clear cache (Ctrl+Shift+Delete), hard refresh (Ctrl+Shift+R) |
| Links not opening | Check browser popup blocker |
| Focus outlines invisible | Check CSS in DevTools Styles tab |
| Mobile layout broken | Check media queries in DevTools |
| Placeholder still showing | CSS not loaded - refresh page |

---

## Expected Behavior Summary

| Action | Expected Result |
|--------|-----------------|
| Load page | 2 cards with logos + links visible |
| Hover card | Subtle shadow/background change |
| Click card | Navigate to intake form |
| Click link | Open website in new tab |
| Tab to element | Focus outline visible |
| Press Enter on card | Select brand |
| Press Enter on link | Open website in new tab |
| Mobile view | Cards stacked, logos 72-96px |
| Desktop view | Cards side-by-side, logos 110-140px |

---

## Sign-Off Criteria

✅ Ready to merge when:
- [ ] No visual issues reported
- [ ] All interactions work as expected
- [ ] Keyboard navigation functional
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Logos render correctly
- [ ] Links don't break selection flow
- [ ] Accessibility verified

---

**Time Required**: 5-10 minutes for quick test
**Full Test Time**: 20-30 minutes (includes cross-browser, detailed accessibility)

**Date Tested**: _______________
**Tested By**: _______________
**Status**: ☐ Pass ☐ Fail (details above)
