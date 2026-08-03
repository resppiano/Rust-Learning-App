# 🦀 Rust Learning App - User Guide

**Welcome!** This guide will help you get the most out of your Rust learning journey.

---

## 📚 Table of Contents

1. [What Is This App?](#what-is-this-app)
2. [Getting Started](#getting-started)
3. [The Two Learning Modes](#the-two-learning-modes)
4. [Using Planner Mode](#using-planner-mode)
5. [Using Mentor Mode](#using-mentor-mode)
6. [Book Integration Features](#book-integration-features)
7. [Your Dashboard](#your-dashboard)
8. [Tips for Success](#tips-for-success)
9. [Common Scenarios](#common-scenarios)
10. [Frequently Asked Questions](#frequently-asked-questions)

---

## What Is This App?

Most coding tutorials teach you **what to type**. This app teaches you **how to think**.

### The Big Idea

Learning Rust is hard because it requires you to think differently about:
- **Memory**: Who owns this data? When does it get cleaned up?
- **Safety**: What could go wrong? How do we prevent it?
- **Problem Solving**: How do I break this down into steps?

Instead of showing you code and saying "memorize this," we:
1. **Ask you questions** that make you think through problems yourself
2. **Use concrete examples** (like lending a notebook) instead of abstract definitions
3. **Meet you where you are** — scaffolding when you're stuck, stepping back when you're ready
4. **Check real understanding** by asking you to apply concepts to new situations

### What Makes This Different?

| ❌ Traditional Tutorials | ✅ This App |
|-------------------------|-------------|
| "Here's the syntax for loops" | "What needs to happen multiple times in your problem?" |
| "Ownership is when..." | "Imagine you lend someone your notebook. What rules would you need?" |
| Shows you the answer | Makes you discover the answer |
| Tests memorization | Tests understanding through transfer |
| One-size-fits-all pacing | Adapts to your responses |

---

## Getting Started

### First Time Using the App?

1. **Open the app** in your browser (usually `http://localhost:3000`)
2. **Read the homepage** — it explains the two modes
3. **Choose your path**:
   - Starting a new problem? → **Planner Mode**
   - Confused by a concept? → **Mentor Mode**
4. **Follow the prompts** — the app will guide you step by step

### What You'll Need

- **A browser** (Chrome, Firefox, Safari, Edge)
- **Time**: 10-15 minutes per Planner session, 5-8 minutes per Mentor session
- **Honesty**: Answer questions based on YOUR thinking, not what you think is "right"
- **Patience**: Learning to think differently takes time!

---

## The Two Learning Modes

Think of these as two tools in your learning toolkit:

### 🗺️ Planner Mode: *"I need to write code for a problem"*

**When to use it:**
- You have a new exercise or challenge
- You know what the problem asks for, but not how to start
- You're staring at a blank file thinking "where do I begin?"

**What it does:**
- Walks you through 11 questions to decompose ANY problem
- Helps you build a plain-English plan BEFORE writing code
- Identifies inputs, outputs, loops, conditions, and edge cases
- Maps your plan to Rust syntax at the end

**Time**: 10-15 minutes

---

### 👨‍🏫 Mentor Mode: *"I'm confused about how this works"*

**When to use it:**
- A concept doesn't make sense (ownership, borrowing, traits, etc.)
- You hit a compile error and don't understand why
- You can write code, but don't really understand what it's doing

**What it does:**
- Teaches concepts through Socratic questions and concrete examples
- Starts with what you already know, builds from there
- Tests real understanding with transfer scenarios (new situations)
- Integrates with The Rust Programming Language book chapters

**Time**: 5-8 minutes per concept

---

## Using Planner Mode

### The 11-Step Journey

Planner Mode walks you through these steps **in order**. Each step asks you questions to help you think through one piece of the problem.

#### **Step 1: Problem Understanding**
*"What is the problem actually asking for?"*

You'll see:
- The problem statement
- A question asking you to identify the goal in plain English

**Example:**
```
Problem: "Write a function that finds the largest number in a list"
Question: "What is the main thing this program needs to do?"

Options:
A) Print every number
B) Find which number is biggest ✓
C) Count how many numbers there are
D) Add all numbers together
```

**Tip**: Don't overthink it — what's the ONE main thing?

---

#### **Step 2: Input Identification**
*"What data does the program receive?"*

You'll identify:
- What data is given to you (inputs)
- The data types (number, text, list, etc.)
- Whether inputs need validation

**Example:**
```
For "find the largest number in a list":
- Input: A list/vector of numbers
- Type: Vec<i32>
- Validation: Check if list is empty
```

**Tip**: Think about what you need from the outside world to solve this.

---

#### **Step 3: Output Specification**
*"What does the program give back?"*

You'll define:
- What result the program produces
- The return type
- What happens in edge cases (empty input, errors, etc.)

**Example:**
```
For "find the largest number":
- Output: The largest number
- Type: i32 (or Option<i32> if list might be empty)
- Edge case: Return None if list is empty
```

---

#### **Step 4: Variable Identification**
*"What values do you need to track?"*

You'll list:
- Variables needed to solve the problem
- What each variable represents
- Initial values

**Example:**
```
For "find the largest number":
- current_max: Tracks the biggest number seen so far
- Initial value: First number in the list (or None)
```

**Tip**: You might not need many variables! Start simple.

---

#### **Step 5: Iteration Detection**
*"What needs to happen multiple times?"*

This is where you identify loops:
- What action repeats?
- What are you looping over?
- When does the loop stop?

**Example:**
```
For "find the largest number":
- Action: Compare each number to current_max
- Loop over: Each number in the list
- Stop when: Reached end of list
```

**Key insight**: If you're doing something to "each item" or "until something happens," you need a loop.

---

#### **Step 6: Conditional Logic**
*"When do you make decisions?"*

You'll identify:
- Branches (if/else)
- What conditions to check
- What to do in each case

**Example:**
```
For "find the largest number":
IF current number > current_max
  THEN update current_max
ELSE keep current_max
```

---

#### **Step 7: Edge Cases**
*"What could go wrong?"*

Think about:
- Empty inputs
- Invalid data
- Boundary conditions (very large/small numbers)
- Unexpected situations

**Example:**
```
For "find the largest number":
- Empty list: Return None or error
- Single item: That item is the max
- All same numbers: Any of them is the max
- Negative numbers: Still works (max could be -1)
```

**Tip**: This step prevents bugs before you write code!

---

#### **Step 8: Error Handling**
*"How should errors be communicated?"*

You'll decide:
- What can go wrong that the caller needs to know about?
- Use `Option<T>` (something or nothing) or `Result<T, E>` (success or specific error)?
- How to handle errors gracefully

**Example:**
```
For "find the largest number":
Use Option<i32>:
- Some(max) if list has items
- None if list is empty
```

---

#### **Step 9: Plain-English Plan**
*"Describe the algorithm in words"*

Write out the steps in order, like you're explaining to a friend:

**Example:**
```
1. Check if list is empty, return None if so
2. Start with first number as current_max
3. For each remaining number:
   - If it's bigger than current_max, update current_max
4. Return Some(current_max)
```

**This is your blueprint.** If you can explain it clearly here, the code will be easier.

---

#### **Step 10: Rust Translation**
*"Map your plan to Rust syntax"*

Now you'll see how your plan translates to Rust:
- Loops → `for`, `while`, `loop`
- Conditions → `if`, `match`
- Collections → `Vec`, `HashMap`, etc.
- Error handling → `Option`, `Result`

The app will suggest Rust constructs based on your answers.

---

#### **Step 11: Verification Plan**
*"How will you test this?"*

Before writing code, plan how you'll know it works:
- What test cases to try?
- What inputs and expected outputs?
- How to verify edge cases?

**Example:**
```
Test cases for "find the largest":
- [1, 5, 3, 2] → Some(5)
- [10] → Some(10)
- [] → None
- [-5, -1, -10] → Some(-1)
```

---

### What Happens Next?

After completing all 11 steps, you'll see:
1. **Your complete plan** in a sidebar
2. **Suggested Rust code structure** based on your answers
3. **A "Start Coding" prompt** with your roadmap ready

**Then you write the code!** But now you have a clear direction.

---

## Using Mentor Mode

### How Mentor Mode Works

Unlike Planner (which follows 11 steps), Mentor Mode adapts to YOU. It has 5 teaching stages, but it escalates or de-escalates based on your responses.

### The 5 Teaching Stages

#### **Stage 1: Open Exploration**
*"What do you already understand?"*

The app starts by asking an open-ended question:
- "What do you think borrowing means in Rust?"
- "Why do you think this error happened?"

**Your job**: Answer honestly. It's okay to be wrong!

**What the app does**:
- If your answer shows understanding → moves forward
- If you're confused or wrong → narrows the question
- If you freeze → switches to forced-choice

---

#### **Stage 2: Narrowing**
*"Let's focus on one part"*

If you're struggling, the app narrows the scope:

Instead of "What is ownership?" → "When you create a String, who is responsible for cleaning it up?"

**This helps** because big abstract concepts are hard, but specific concrete questions are manageable.

---

#### **Stage 3: Forced-Choice**
*"Pick the option that makes most sense"*

If you're still stuck, you get multiple-choice questions with plausible-but-wrong options:

```
When you pass a String to a function in Rust, by default:

A) The function gets a copy and both can use it
B) The function gets ownership and the original can't use it anymore ✓
C) Both share ownership and can modify it
D) The function gets a temporary reference that disappears after
```

**Why wrong answers help**: They teach you what NOT to do and why. Each wrong option represents a common misconception.

---

#### **Stage 4: Concrete Anchor**
*"Let's use an analogy you already understand"*

The app introduces a metaphor:

> "Imagine you lend your notebook to a friend. While they have it, you can't write in it. When they give it back, you can use it again. Rust ownership works the same way."

**Why this works**: Your brain already understands lending physical objects. Now you can transfer that understanding to code.

---

#### **Stage 5: Transfer Check**
*"Apply this to a new situation"*

Finally, the app gives you a FRESH scenario you haven't seen before:

```
You've learned about borrowing. Now:

What happens if you borrow a mutable reference to a vector, 
then try to read from the same vector using the original owner?

A) It works fine
B) Compile error: can't read while mutably borrowed ✓
C) Runtime panic
D) The read sees stale data
```

**This is the real test**: Can you reason about new cases, or did you just memorize the example?

If you get this right → **concept mastered!**  
If you get this wrong → the app re-teaches with a new angle.

---

### Special Features in Mentor Mode

#### **Error-Triggered Learning**

When you write Rust code and hit a compile error, you can:
1. Copy the error message
2. Paste it into Mentor Mode
3. The app detects the error type and teaches the underlying concept

**Example:**
```
Error: "borrow of moved value: `s`"

App detects: Ownership/move semantics issue
→ Launches Mentor session on Ownership
→ After learning, suggests how to fix your code
```

---

#### **Book Integration**

Mentor Mode connects to *The Rust Programming Language* book:

**Before teaching**: "This concept is covered in Chapter 4.1. Would you like to read that section first?"

**During teaching**: Code examples reference book sections

**After mastering**: "You've mastered ownership! Chapter 4.2 on borrowing builds on this."

---

#### **Discussion Prompts**

After learning a concept, you'll see reflection questions:

- **Book vs Code**: "The book says X. Your code did Y. What's different?"
- **Misconception**: "Many people think borrowing is like copying. Why is that wrong?"
- **Transfer**: "If you needed to modify a string in multiple functions, what pattern would you use?"
- **Reflection**: "What was the 'aha!' moment for you with this concept?"

**These deepen understanding** by making you articulate what you learned.

---

## Book Integration Features

### What Is The Rust Programming Language Book?

It's the official, free Rust textbook (also called "the Book"). This app integrates with it to give you:
- **Chapter references** for every concept
- **Read-along recommendations** (before/during/after exercises)
- **Discussion prompts** comparing book explanations to your code

### How to Use Book Integration

#### **1. Read-Along Sync**

When starting an exercise, the app might suggest:

```
📖 Before you start:
Read Chapter 2 (Guessing Game) to see a complete example.
Time: ~15 minutes

[Start Reading] [Skip for Now]
```

**When to read**:
- **Before**: Get oriented on what you're about to do
- **During**: Look up syntax you're trying to use
- **After**: Deepen understanding of concepts you just used

---

#### **2. Error → Chapter Mapping**

When you hit an error, the app shows:

```
❌ Error: cannot borrow `x` as mutable more than once

📖 This relates to Chapter 4.2: References and Borrowing

[Learn This Concept] [See Book Section] [Fix It Myself]
```

---

#### **3. Progress Tracking**

Your dashboard shows:
- **Concepts mastered**: 8/15
- **Book chapters covered**: 3, 4, 5, 8
- **Recommended next reading**: Chapter 6 (Enums)

This helps you see your learning path through the book.

---

## Your Dashboard

### What's On the Dashboard?

Access it anytime from the top navigation.

#### **1. Progress Overview**

```
🎯 Your Progress

Concepts Mastered: 8/15  ████████░░░░░░░  53%
Exercises Completed: 12
Active Sessions: 1
```

---

#### **2. Concept Mastery**

A list of all Rust concepts with status:
- ✅ **Mastered**: Passed transfer check
- 🔄 **Learning**: Currently in progress
- ⏸️ **Not Started**: Haven't tackled yet

**Concepts tracked**:
- Variables & Mutability
- Ownership
- Borrowing
- Lifetimes
- Structs
- Enums & Pattern Matching
- Error Handling (Option/Result)
- Traits
- Generics
- Collections (Vec, HashMap, etc.)
- Iterators
- Closures
- Smart Pointers
- Concurrency
- Unsafe Rust

---

#### **3. Recent Activity**

See your last 10 sessions:
- What mode (Planner/Mentor)
- What concept or exercise
- When it was
- Completion status

---

#### **4. Recommended Next Steps**

Based on your progress, the app suggests:
- "You've mastered ownership! Ready for borrowing?"
- "Try Exercise 3 (guessing game) to apply what you learned"
- "Read Chapter 6 to prepare for enums"

---

## Tips for Success

### For Planner Mode

✅ **DO:**
- Answer based on YOUR understanding, not what you think is "right"
- Take time on each question — rushing leads to weaker plans
- Write your plain-English plan (Step 9) like you're explaining to a friend
- Plan edge cases (Step 7) BEFORE coding — this prevents bugs

❌ **DON'T:**
- Skip steps — each builds on the previous
- Copy-paste solutions you found online into the plan
- Worry about perfect Rust syntax during planning (that comes later)
- Get frustrated if you don't know the answer — that's what the forced-choice options are for!

---

### For Mentor Mode

✅ **DO:**
- Try the open questions first, even if you're unsure
- Think through WHY the wrong options are wrong
- Actually try the transfer scenarios — they reveal gaps
- Use the book references to deepen understanding
- Ask for the same concept again if you need reinforcement

❌ **DON'T:**
- Jump straight to forced-choice — try open questions first
- Memorize answers — the app will catch this with transfer checks
- Skip discussion prompts — they cement learning
- Feel bad about wrong answers — they teach the reasoning space!

---

### General Learning Tips

**1. Consistency > Intensity**
- 30 minutes daily beats 3 hours once a week
- Finish one concept before starting another

**2. Write Code Between Sessions**
- The app teaches thinking, but you need practice too
- Apply concepts to your own projects

**3. Embrace Confusion**
- "I don't understand this yet" is progress
- The app adapts to confusion — it's part of the design

**4. Track Your "Aha!" Moments**
- When something clicks, write it down
- These insights are YOUR mental model forming

**5. Test Your Understanding**
- If you can explain a concept to someone else, you've learned it
- Try teaching what you learned to a friend (or rubber duck)

---

## Common Scenarios

### Scenario 1: "I'm Starting a New Exercise"

**Your workflow:**
1. Open the app → Planner Mode
2. Read the problem carefully
3. Work through all 11 steps honestly
4. Review your complete plan in the sidebar
5. Open your code editor and follow your plan
6. If you hit an error → switch to Mentor Mode

**Expected time**: 10-15 min planning + 30-60 min coding

---

### Scenario 2: "I Got a Compile Error I Don't Understand"

**Your workflow:**
1. Copy the error message
2. Open Mentor Mode
3. Paste the error OR select the concept (ownership, borrowing, etc.)
4. Work through the Socratic dialogue
5. Take the transfer check to verify understanding
6. Return to your code and apply what you learned

**Expected time**: 5-8 minutes

---

### Scenario 3: "I Can Write the Code, But Don't Really Understand It"

**Your workflow:**
1. Open Mentor Mode
2. Select the concept you're fuzzy on (e.g., "Lifetimes")
3. Answer open questions to surface what you do/don't know
4. Work through concrete anchors and examples
5. Test yourself with the transfer scenario
6. Read the recommended book chapter for depth

**Expected time**: 10-15 minutes

---

### Scenario 4: "I'm Preparing for a Job Interview"

**Your workflow:**
1. Use Dashboard to see which concepts you've mastered
2. For weak areas, run through Mentor Mode sessions
3. Practice explaining concepts out loud (discussion prompts help)
4. Do Planner Mode on interview-style problems
5. Focus on transfer checks — interviewers test this!

**Expected time**: 1-2 hours spread over several days

---

### Scenario 5: "I'm Working Through the Rust Book"

**Your workflow:**
1. Read a chapter in the book
2. Open Planner Mode for the chapter's exercises
3. Use Mentor Mode for concepts that confuse you
4. Check Dashboard to see book/concept alignment
5. Use discussion prompts to compare book's explanation to your understanding

**Integrated learning** = stronger retention

---

## Frequently Asked Questions

### About the App

**Q: Do I need to know any Rust before using this?**  
A: No! The app assumes you're a complete beginner. It teaches decomposition skills that work for ANY programming language, then maps them to Rust syntax.

**Q: How is this different from reading the Rust book?**  
A: The book TELLS you how Rust works. This app makes you DISCOVER it through questions. Research shows active learning (Socratic method) leads to deeper understanding than passive reading.

**Q: Can I use this alongside other resources?**  
A: Absolutely! It's designed to complement the Rust book, Rustlings exercises, and any other learning path.

**Q: How long until I'm "done" with the app?**  
A: When you've mastered all 15 core concepts and can pass transfer checks consistently. For most learners, this takes 20-40 hours spread over several weeks.

---

### About Planner Mode

**Q: Do I have to follow all 11 steps every time?**  
A: For full problems, yes — each step builds on the previous. Once you're experienced, you can internalize this process and plan in your head. But early on, the structure helps.

**Q: What if I don't know the answer to a step?**  
A: That's okay! Forced-choice options give you plausible answers to think through. Picking the "wrong" answer teaches you what NOT to do.

**Q: Can I change my answers later?**  
A: Yes, the plan is live — you can go back and revise earlier steps if you realize something.

**Q: Is the plain-English plan (Step 9) just busywork?**  
A: No! This is the most important step. If you can't explain your algorithm in plain English, your code will be messy. This step forces clarity.

---

### About Mentor Mode

**Q: What if I still don't understand after the session?**  
A: Run through it again! Concepts like ownership take multiple exposures. The app will present new examples and angles.

**Q: Why do you ask me to apply concepts to new situations?**  
A: Transfer checks verify TRUE understanding. You can memorize examples, but can you reason about new cases? That's real mastery.

**Q: Can I skip the open questions and go straight to multiple-choice?**  
A: You can, but don't! Struggling with open questions THEN seeing forced-choice options is more effective than jumping to hints immediately.

**Q: What are "concrete anchors"?**  
A: Metaphors from everyday life (lending notebooks, restaurant menus, etc.) that make abstract programming concepts tangible.

---

### About Learning Rust

**Q: Why is Rust so hard to learn?**  
A: Rust requires you to think explicitly about memory, ownership, and safety — things other languages handle implicitly. It's not harder, just DIFFERENT. This app teaches that different way of thinking.

**Q: How long does it take to learn Rust?**  
A: You can write basic programs in a few weeks. True comfort with ownership/borrowing takes 2-3 months of regular practice. Fighting the borrow checker gets easier!

**Q: Should I learn another language first?**  
A: Not necessary! Some people find Rust easier WITHOUT habits from other languages. The app teaches decomposition skills that transfer everywhere.

**Q: What if I keep failing the transfer checks?**  
A: That means the concept hasn't "clicked" yet — which is valuable feedback! The app will re-teach from a different angle. Learning isn't linear.

---

### Technical Questions

**Q: Does this work offline?**  
A: The frontend can run offline once loaded, but Mentor Mode needs an internet connection to generate teaching content (it uses LLMs for adaptive responses).

**Q: Can I use this on mobile?**  
A: The interface is responsive, but the experience is best on a laptop/desktop where you can have the app AND code editor open side-by-side.

**Q: Is my progress saved?**  
A: Yes! All sessions, answers, and progress are saved to the database. You can close the browser and come back anytime.

**Q: Can I export my plans or notes?**  
A: (Future feature) Currently, you can copy-paste from the plan sidebar. Export functionality is planned for a future update.

---

## What's Next?

### Now That You've Read This Guide

1. **Start with Planner Mode** on a simple exercise (e.g., "find the largest number")
2. **Try Mentor Mode** on a concept that confuses you (ownership is the classic)
3. **Check your Dashboard** after a few sessions to see progress
4. **Read The Rust Programming Language book** alongside the app
5. **Keep coding** — the app teaches thinking, but practice makes permanent!

---

## Need Help?

### Still Confused?

- **Re-read** the section of this guide that applies to what you're stuck on
- **Try a different mode**: If Planner isn't clicking, try Mentor (or vice versa)
- **Read the book section** recommended by the app
- **Take a break** and come back — sometimes concepts need time to marinate

### Found a Bug or Have Feedback?

- Check the `docs/` folder for technical details
- See `GETTING_STARTED.md` for setup issues
- Review `technical-spec.md` for how the app works under the hood

---

## Remember

**Learning Rust is a marathon, not a sprint.** 

This app is designed to:
- ✅ Teach you HOW to think, not WHAT to type
- ✅ Meet you where you are and adapt
- ✅ Make confusion productive (not frustrating)
- ✅ Build transferable problem-solving skills

**You've got this!** 🦀

---

*Last updated: 2026-08-03*
