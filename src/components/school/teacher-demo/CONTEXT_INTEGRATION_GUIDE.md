/**
 * TEACHER CONTEXT AWARENESS INTEGRATION GUIDE
 * 
 * This document explains how to integrate the Teacher Context Awareness system
 * into other surfaces beyond the Messages Workspace.
 */

// ============================================================================
// 1. EMAIL WORKSPACE INTEGRATION
// ============================================================================

/*
File: src/components/school/teacher-demo/email-workspace.tsx

Pattern: Similar to messages, wrap email body text with context detection.

Steps:
1. Import at top:
   import { detectContextInText } from "./teacher-context-engine";
   import { MessageTextWithTeacherContext } from "./teacher-context-trigger";
   import { TeacherContextActionModal } from "./teacher-context-modals";

2. Add state for context modal:
   const [selectedContext, setSelectedContext] = useState<DetectedContext | null>(null);
   const [isContextModalOpen, setIsContextModalOpen] = useState(false);

3. When rendering email body, replace simple text rendering with:
   {detectedContexts.length > 0 ? (
     <MessageTextWithTeacherContext
       text={email.body}
       contexts={detectedContexts}
       onAction={handleContextAction}
     />
   ) : (
     email.body
   )}

4. Add modal at end of component (before closing return div):
   <TeacherContextActionModal
     context={selectedContext}
     isOpen={isContextModalOpen}
     onClose={() => { setIsContextModalOpen(false); }}
     onConfirm={handleContextConfirm}
   />

Benefits:
- Teachers can create events/tasks/reminders from detected email content
- Maintains consistency with messages workspace
- Respects progressive disclosure pattern
*/

// ============================================================================
// 2. CALENDAR WORKSPACE INTEGRATION
// ============================================================================

/*
File: src/components/school/teacher-demo/calendar-workspace.tsx

Pattern: Add quick-action button in calendar day cells when context is high confidence

Steps:
1. When rendering calendar day cells, after existing content:
   if (detectedContexts.length > 0 && detectedContexts[0].type === 'event') {
     <button
       className="mt-2 text-xs bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded"
       onClick={() => handleContextAction(detectedContexts[0])}
     >
       ✨ Create Event
     </button>
   }

2. This allows teachers to quickly create calendar events from detected text
3. No modal needed - can directly create since it's already in calendar context
*/

// ============================================================================
// 3. CLASS SPACE WORKSPACE INTEGRATION
// ============================================================================

/*
File: src/components/school/teacher-demo/class-space-workspace.tsx

Pattern: Detect task opportunities in class messages/announcements

Steps:
1. When rendering class announcements or messages:
   const contextResults = detectContextInText(announcement.text);
   
   // If task detected and target group identified:
   if (contextResults.some(c => c.type === 'task') && contextResults[0].targetGroup) {
     <button className="hover:bg-cyan-500/10 px-2 py-1 rounded text-cyan-400 text-xs">
       📋 Create Task for {contextResults[0].targetGroup}
     </button>
   }

Benefits:
- Reduces manual entry for task creation
- Keeps context of which class/group the task is for
- Progressive disclosure - only shows when confidence is high
*/

// ============================================================================
// 4. ASSIGNMENTS PANEL INTEGRATION
// ============================================================================

/*
If exists: src/components/school/teacher-demo/assignments-panel.tsx

Pattern: Detect assignment deadlines in messages and sync with assignments

Steps:
1. Scan all recent messages for assignment context:
   const allAssignments = detectContextInText(message.text)
     .filter(c => c.type === 'assignment');

2. Show as draft assignments:
   <div className="bg-amber-500/5 border border-amber-500/20 rounded p-3">
     <p className="text-amber-400 text-xs">
       💡 Detected: {assignment.title}
     </p>
     <button onClick={() => handleContextAction(assignment)}>
       Add to Assignments
     </button>
   </div>
*/

// ============================================================================
// 5. ESSENTIAL SPACE WORKSPACE INTEGRATION
// ============================================================================

/*
File: src/components/school/teacher-demo/essential-space-workspace.tsx

Pattern: Add "Captured Context" items when high-confidence tasks detected

Steps:
1. When capturing notes or items, also scan text for context:
   const contexts = detectContextInText(capturedText);
   
2. If task or event detected:
   <CapturedItem
     title={contexts[0].title}
     meta={contexts[0].actionLabel}
     actionable={true}
     onAction={() => handleContextAction(contexts[0])}
   />

Benefits:
- Automatically surfaces action items from captured notes
- Integrates with existing essential space workflow
*/

// ============================================================================
// 6. COORDINATOR COLLABORATION CONTEXT
// ============================================================================

/*
When Teacher messages Coordinator about academic items:

Pattern: Teacher context detects "meet" or "schedule coordination"
and automatically suggests creating a meeting with coordinator, passing
context about who/what needs coordination.

Example flow:
Teacher message: "Sarah Chen, can we meet about Chloe's Physics IA workload?"
Context Engine detects:
- Meeting request
- Target person: Sarah Chen
- Context: Chloe Vance, Physics IA

Modal pre-fills:
- Title: "Chloe Vance Physics IA Workload Discussion"
- Participants: [Sarah Chen]
- Description: Auto-extracted
- Time: Suggestions based on teacher's free periods
*/

// ============================================================================
// 7. SETTINGS AND PREFERENCES
// ============================================================================

/*
Recommendations for settings.tsx or preferences:

- Context Confidence Threshold: Slider (0.7 - 0.95)
  Controls which detections show indicators (higher = fewer suggestions)

- Context Types Toggle: Checkboxes
  [ ] Events
  [ ] Meetings
  [ ] Tasks
  [ ] Reminders
  [ ] Assignments
  [ ] Follow-ups

- Auto-Actions: 
  [ ] Auto-create reminders (no modal, just create)
  [ ] Auto-suggest but don't show (subtle indicator only)

- Toast Duration: Slider (1s - 5s)
  How long confirmation notifications show
*/

// ============================================================================
// CORE PRINCIPLES FOR ALL INTEGRATIONS
// ============================================================================

/*
1. PROGRESSIVE DISCLOSURE
   - Subtle indicator first (dashed underline, glow, badge)
   - Hover reveals context (tooltip)
   - Click opens modal for confirmation
   - Never auto-create without confirmation (except optional auto-reminders)

2. TEACHER CONTROL
   - Teacher always decides when to create
   - Clear pre-filled information for review
   - Easy to modify before confirming
   - Can dismiss/ignore detections without friction

3. APPROPRIATE ACTIONS ONLY
   - Events, Meetings, Tasks, Reminders, Assignments, Follow-ups
   - NO operational/administrative actions
   - NO issue escalations
   - NO facility requests
   - Those remain coordinator-specific

4. CONSISTENCY
   - Same interaction pattern across all surfaces
   - Same visual styling (cyan-400 for indicators)
   - Same modal design and flow
   - Same notification/toast patterns

5. SMART DEFAULTS
   - Auto-detect confidence score
   - Extract date when possible
   - Identify target group/class
   - Populate participants from context
   - But always let teacher review/modify
*/

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/*
When implementing context awareness in a new surface:

□ Test context detection with various message formats
□ Hover indicator appears correctly
□ Tooltip shows with pre-filled information
□ Modal opens when indicator clicked
□ Form fields have correct pre-fills
□ Can modify all fields before confirming
□ Confirm button creates item (mock or real)
□ Toast notification shows after creation
□ Modal closes properly
□ Dismiss/Cancel doesn't create anything
□ High confidence detections show indicators
□ Low confidence detections don't show (> 0.7 threshold)
□ Target group detection works (Grade 10, Physics HL, etc.)
□ Date extraction works (tomorrow, Friday, May 29, etc.)
□ Responsive on mobile (if applicable)
□ Accessibility (keyboard nav, screen reader hints)
*/
