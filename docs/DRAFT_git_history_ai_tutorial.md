# How to Bulk-Edit Git Commit History Using AI (Without Manual Rebasing)

*Published: [DATE]*

## The Problem: Your Git History Needs a Makeover

You're preparing your GitHub portfolio for job applications. You open your repository and scroll through the commit history. Your heart sinks:

```
feat(admin): Add dashboard layout
fix: typo in login form
WIP: working on user auth
admin(ui): improve styles
fix remember checkbox state
refactor(api): Update endpoint names
```

It's a mess of different formats, conventional commit prefixes you no longer use, lowercase starts, and inconsistent styles. Cleaning this up manually would mean interactive rebasing through dozens (or hundreds) of commits, rewriting each one by hand. That's hours of tedious, error-prone work.

**What if you could describe what you want changed, and have AI do it all in seconds?**

## The Solution: AI-Assisted Git Filter-Branch

This tutorial teaches a powerful workflow: using AI (like Claude, ChatGPT, or Copilot) to generate and execute git commands that transform your entire commit history at once. While I'll use my specific examples (removing conventional commit prefixes and fixing capitalization), the pattern works for **any text transformation** you need.

### What You'll Learn

- The general workflow for AI-assisted git history editing
- Real examples with actual commands that worked
- How to safely test and apply bulk changes
- Common use cases beyond my examples
- When NOT to rewrite history

### Prerequisites

- Basic git knowledge (commits, branches)
- Access to an AI assistant (Claude Code, ChatGPT, GitHub Copilot, etc.)
- A local git repository you want to clean up
- **Backup your repository first!**

---

## The General Workflow

Here's the universal pattern you can use for ANY commit message transformation:

### Step 1: Identify Your Pattern

Look at your git history and identify what needs to change:

```bash
git log --oneline -20
```

Ask yourself:
- What's inconsistent?
- What pattern do I want to remove/add/change?
- Do I need to fix capitalization?
- Are there typos or formatting issues?

### Step 2: Describe It to AI

Open your AI assistant and describe **exactly** what you want:

> "I have git commits with prefixes like 'feat(admin):', 'fix:', 'admin(ui):' etc. I want to remove all these prefixes and ensure the first letter after removal is capitalized. For example:
> - 'feat(admin): add dashboard' → 'Add dashboard'
> - 'fix: typo in form' → 'Typo in form'
> Can you help me write a git filter-branch command to do this?"

**Be specific.** Include examples of before/after.

### Step 3: AI Generates the Command

The AI will generate a `git filter-branch --msg-filter` command. This is the magic tool that rewrites commit messages in bulk.

### Step 4: Review and Test

- **Always** review the AI's command before running it
- Test on a branch or backup first
- Check a few commits manually after to verify

### Step 5: Execute and Clean Up

Run the command, then clean up git's internal references:

```bash
# Remove backup refs
rm -rf .git/refs/original/

# Expire reflog and garbage collect
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

---

## Real Example: My Git History Cleanup

Let me walk you through what I actually did to clean up my portfolio repository, step by step.

### My Starting Point

My git history looked like this:

```bash
$ git log --oneline -15

9687204 feat(admin): project list admin area, clicking a project goes to the create/edit project form.
da9d5f2 feat(projects): make project titles clickable links on project list page.
dec80c0 admin(feat): Added project creation success message.
88a8489 admin(ui): Added dashboard layout to profile.
28e8c05 test(validation): Fix missing vite import for project creation validation.
79a4c03 admin(feat): Add aria-label for screen readers.
83b547a fix remember checkbox state
ca9b2dd feat(admin): add admin project creation form (React + Inertia)...
c66eed0 feat(validation): add and test full project creation rules...
```

I had three problems:
1. **Conventional commit prefixes** like `feat(admin):`, `fix:`, `admin(ui):`
2. **Inconsistent capitalization** (some lowercase after prefix removal)
3. **One completely lowercase commit** (`fix remember checkbox state`)

### Step 1: Describing the Problem to AI

I told my AI assistant (Claude Code):

> "I have git commits with prefixes like `feat(admin):`, `admin(feat):`, `build(deps):`, etc. Can you remove those prefixes from the commit messages? Each one should start with a capital letter afterwards."

### Step 2: AI's First Solution

The AI generated this command:

```bash
git filter-branch -f --msg-filter '
  # Remove prefix patterns like "feat(admin):", "admin(feat):", etc.
  message=$(cat)

  # Remove the prefix and any following whitespace
  cleaned=$(echo "$message" | sed -E "s/^[a-zA-Z]+\([^)]+\):\s*//")

  # Capitalize first letter if prefix was removed
  if [ "$cleaned" != "$message" ]; then
    first_char=$(echo "$cleaned" | cut -c1 | tr "[:lower:]" "[:upper:]")
    rest=$(echo "$cleaned" | cut -c2-)
    echo "${first_char}${rest}"
  else
    echo "$message"
  fi
' -- --all
```

**What this does:**
- `--msg-filter` runs the script on every commit message
- `sed -E "s/^[a-zA-Z]+\([^)]+\):\s*//"` removes patterns like `feat(admin):`
- The script capitalizes the first letter after removal
- `-- --all` applies to all branches

### Step 3: Running and Verifying

```bash
# First, I stashed uncommitted changes
$ git stash

# Then ran the filter-branch command
$ git filter-branch -f --msg-filter '...' -- --all

Rewrite 2f0b9fa (1/41) (0 seconds passed, remaining 0 predicted)
Rewrite 50c2b95 (2/41) (0 seconds passed, remaining 0 predicted)
...
Ref 'refs/heads/main' was rewritten
```

**Checking the results:**

```bash
$ git log --oneline -15

0498993 Project list admin area, clicking a project goes to the create/edit project form.
eb48926 Make project titles clickable links on project list page.
d5e5bd8 Added project creation success message.
0078620 Added dashboard layout to profile.
7df31c0 Fix missing vite import for project creation validation.
5b0c951 Add aria-label for screen readers.
3edb8f7 fix remember checkbox state  # <- Still lowercase!
eafd213 A  # <- BROKEN!
```

### Step 4: Finding and Fixing Problems

Two issues remained:
1. One commit still lowercase: `fix remember checkbox state`
2. One commit got mangled to just `A` (the "Add admin project creation form" commit)

I checked the broken commit:

```bash
$ git log eafd213 -1 --format=%B

A

-
-
-
-
-
-dd admin project creation form (React + Inertia)...
```

The first letter got separated somehow! I needed to fix both issues.

### Step 5: Targeted Fix with AI

I described the new problems:

> "Two commits didn't get fixed:
> 1. One shows as just 'A' but should be 'Add admin project creation form (React + Inertia)...'
> 2. One is still lowercase: 'fix remember checkbox state' → should be 'Fix remember checkbox state'
> Can you write a filter-branch command that fixes just these two?"

The AI generated a more targeted script:

```bash
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --msg-filter '
  message=$(cat)

  # Fix the mangled "A" commit
  if echo "$message" | head -1 | grep -q "^A$"; then
    echo "Add admin project creation form (React + Inertia) with live validation, shared constants, and autosizing"
    echo ""
    echo "Created Create.tsx React form for admin/projects"
    echo "Integrated server-side + client-side validation with Inertia"
    echo "Synced max lengths via shared JSON constants"
    echo "Added CharacterCount components and autosizing for description"
    echo "Auto-generate slugs from title with manual override support"
    echo "Unit test added for backend constant consistency"
  # Fix the lowercase "fix remember" commit
  elif echo "$message" | head -1 | grep -q "^fix remember checkbox state"; then
    echo "Fix remember checkbox state"
  else
    echo "$message"
  fi
' -- --all
```

**What's different here:**
- Targets specific commits by pattern matching
- Provides exact replacement text for the mangled commit
- Simple capitalization fix for the lowercase one
- Passes through all other commits unchanged

### Step 6: Final Verification

```bash
$ git log --oneline -20

ae68413 Update setup script and remove old prototype
8d34779 Add session documentation
2d4e54f Add frontend test suite with Vitest
d18c591 Configure Vite for WSL development and testing
9e94955 Implement portfolio design with sage green theme
110f33b Add lucide-react icon library
1f2012e Add project edit/update functionality
...
db6d359 Add admin project creation form (React + Inertia)...  # ✅ Fixed!
...
284868a Fix remember checkbox state  # ✅ Fixed!
```

Perfect! All commits now have:
- ✅ No conventional commit prefixes
- ✅ Proper capitalization
- ✅ Consistent formatting
- ✅ Professional appearance

### Step 7: Cleanup

Finally, I cleaned up the internal git references:

```bash
# Remove filter-branch backup refs
$ rm -rf .git/refs/original/

# Expire reflog entries and garbage collect
$ git reflog expire --expire=now --all
$ git gc --prune=now --aggressive
```

**Total time: About 5 minutes** (most of that was checking results). Manual rebasing would have taken hours.

---

## Common Use Cases for This Technique

Now that you understand the pattern, here are other scenarios where AI-assisted filter-branch is valuable:

### 1. Removing WIP/TODO Commits

**Before:**
```
WIP: working on auth
WIP: still debugging
TODO: fix this later
```

**After:**
```
Working on auth
Still debugging
Fix this later
```

**Prompt to AI:**
> "Remove 'WIP: ' and 'TODO: ' prefixes from all commit messages and capitalize the first letter after removal"

### 2. Adding Ticket Numbers

**Before:**
```
Fix login bug
Add user dashboard
```

**After:**
```
[PROJ-123] Fix login bug
[PROJ-124] Add user dashboard
```

**Prompt to AI:**
> "I need to add ticket numbers to commits. The commits from June should get [PROJ-123], commits from July should get [PROJ-124]. Can you help me write a filter-branch command that checks the commit date and adds the appropriate ticket number?"

### 3. Standardizing to Imperative Mood

**Before:**
```
Added user authentication
Fixed the login bug
Updating the README
```

**After:**
```
Add user authentication
Fix the login bug
Update the README
```

**Prompt to AI:**
> "Convert all commit messages to imperative mood: 'Added' → 'Add', 'Fixed' → 'Fix', 'Updating' → 'Update'"

### 4. Fixing Recurring Typos

**Before:**
```
Update authetication flow
Fix authetication bug
Add authetication tests
```

**After:**
```
Update authentication flow
Fix authentication bug
Add authentication tests
```

**Prompt to AI:**
> "I misspelled 'authentication' as 'authetication' in multiple commits. Replace all instances across commit messages"

### 5. Changing Tone (Informal → Professional)

**Before:**
```
lol fixed that annoying bug
meh, updated styles
finally got this working!!!
```

**After:**
```
Fix rendering bug
Update component styles
Implement user authentication flow
```

**Prompt to AI:**
> "Make these commit messages professional by removing informal language, exclamation marks, and providing clearer descriptions"

---

## The AI's Role: Your Personal Git Script Generator

What makes this workflow powerful is that **you don't need to be a bash/sed/awk expert**. The AI:

1. **Understands git filter-branch syntax** (which is complex and easy to mess up)
2. **Generates regex patterns** for you (no need to remember sed syntax)
3. **Handles edge cases** (empty lines, multi-line messages, special characters)
4. **Iterates with you** if the first attempt doesn't work perfectly
5. **Explains what the command does** so you can learn

### Tips for Working with AI on Git Tasks

**Be specific:**
❌ "Fix my git history"
✅ "Remove all instances of 'WIP: ' from commit message titles"

**Provide examples:**
❌ "Make my commits professional"
✅ "Change 'lol fixed bug' to 'Fix critical bug in authentication flow'"

**Ask for explanations:**
> "Can you explain what each part of this sed command does?"

**Iterate:**
> "That worked for most commits, but these three still have issues: [paste examples]. Can you update the script?"

**Request safety checks:**
> "Before I run this, what could go wrong? Should I test it differently?"

---

## Important Warnings and Best Practices

### ⚠️ When NOT to Rewrite History

**Don't rewrite if:**
- The repository is **public and actively used by others**
- Commits have been **pulled by teammates** (coordinate first!)
- You're working on an **open source project** (huge disruption)
- Commits are **tagged in production releases**

**It's safe if:**
- It's your personal portfolio project
- Working alone or with close team coordination
- Repository is private/not yet shared
- You're comfortable with force pushing

### 🔒 Safety Checklist

Before running any history-rewriting command:

1. ☑️ **Backup your repository**
   ```bash
   # Clone to backup location
   git clone /path/to/repo /path/to/backup
   ```

2. ☑️ **Check for uncommitted changes**
   ```bash
   git status
   # Stash if needed
   git stash
   ```

3. ☑️ **Test on a branch first**
   ```bash
   git checkout -b test-rewrite
   # Run filter-branch here
   # Check results
   # If good, switch back to main and repeat
   ```

4. ☑️ **Verify a few commits manually**
   ```bash
   git log -10 --format=medium
   # Read through and check they look right
   ```

5. ☑️ **Understand force push implications**
   ```bash
   # When you push, use:
   git push --force-with-lease origin main
   # This is safer than --force
   ```

### 🧹 Cleanup After Filter-Branch

Always clean up after successfully rewriting:

```bash
# Remove backup refs created by filter-branch
rm -rf .git/refs/original/

# Expire reflog entries immediately
git reflog expire --expire=now --all

# Garbage collect and compress
git gc --prune=now --aggressive
```

This removes the old commit objects and truly rewrites history.

---

## Troubleshooting Common Issues

### Problem: "Cannot rebase: You have unstaged changes"

**Solution:**
```bash
git stash
# Run your filter-branch command
git stash pop
```

### Problem: Some commits didn't change

**Cause:** Your pattern didn't match them.

**Solution:**
- Check the exact format: `git log <commit-hash> -1 --format=%B`
- Update your AI prompt with the actual text
- Run filter-branch again (it's safe to run multiple times)

### Problem: Commit message got mangled/corrupted

**Cause:** Special characters or encoding issues.

**Solution:**
- Identify the broken commit: `git log --oneline | grep [pattern]`
- Get original message: Check backup or use AI to reconstruct
- Run targeted filter-branch with exact replacement text (like I did above)

### Problem: "WARNING: Ref 'refs/remotes/origin/main' is unchanged"

**This is fine!** It just means the remote hasn't been updated yet. After you verify your local changes are correct, force push to update the remote.

---

## Real-World Impact: Before and After

Here's what this cleanup did for my portfolio repository:

### Before Cleanup
```bash
$ git log --oneline -10

9687204 feat(admin): project list admin area, clicking...
da9d5f2 feat(projects): make project titles clickable links...
dec80c0 admin(feat): Added project creation success message.
88a8489 admin(ui): Added dashboard layout to profile.
28e8c05 test(validation): Fix missing vite import...
79a4c03 admin(feat): Add aria-label for screen readers.
83b547a fix remember checkbox state
ca9b2dd feat(admin): add admin project creation form...
c66eed0 feat(validation): add and test full project...
a0fe163 docs(contributions): Added contributions content.
```

**Problems:**
- Inconsistent prefix styles (feat(admin), admin(feat), etc.)
- Lowercase commit
- Looks like I was following a convention I later abandoned
- Not professional for a portfolio

### After Cleanup
```bash
$ git log --oneline -10

a72f772 Project list admin area, clicking a project goes...
b0cfdd0 Make project titles clickable links on project list page.
33f75cc Added project creation success message.
adae269 Added dashboard layout to profile.
88f7eaf Fix missing vite import for project creation validation.
498af61 Add aria-label for screen readers.
284868a Fix remember checkbox state
db6d359 Add admin project creation form (React + Inertia)...
bd6ffcd Add and test full project creation rules via FormRequest.
e9dac5b Added contributions content.
```

**Result:**
- ✅ Clean, professional appearance
- ✅ Consistent formatting throughout
- ✅ Easy to read and understand
- ✅ Portfolio-ready

---

## Conclusion: AI as Your Git History Editor

You don't need to be a git wizard or spend hours manually rebasing. With AI assistance, you can:

- **Describe what you want in plain English**
- **Get working commands generated for you**
- **Clean up hundreds of commits in minutes**
- **Iterate until it's perfect**

The pattern is simple:
1. Identify your pattern
2. Describe it to AI
3. Review the generated command
4. Test and apply
5. Verify and clean up

This technique applies to **any text transformation** in git history, not just removing prefixes. The AI handles the complex bash/sed/regex work while you focus on what you actually want to change.

### Key Takeaways

- 🤖 **AI can generate git filter-branch commands** from plain English descriptions
- ⚡ **Save hours** compared to manual interactive rebasing
- 🎯 **Precise and consistent** - no human error in repetitive edits
- 🔄 **Iterative** - refine the command until results are perfect
- 📚 **Transferable skill** - use for any bulk commit message editing
- ⚠️ **Use responsibly** - only on personal/private repos or with team coordination

### Next Steps

Try it yourself! Pick a small repository and:
1. Identify something you want to change in your commit history
2. Describe it to your AI assistant
3. Review and run the generated command
4. Share your results!

Have you used AI to clean up git history? What transformations have you done? Let me know in the comments!

---

**About this tutorial:** All commands and examples are from a real cleanup I performed on my Laravel + React portfolio project. The git history shown is actual output from my repository, demonstrating that this technique works in production use.

**Tools used:**
- Git 2.x
- Claude Code (AI assistant)
- Bash shell (WSL2/Linux/macOS)

**Want to see the full project?** Check out my [Project Archive on GitHub](https://github.com/SabrinaMarkon/project-archive) to see the cleaned-up commit history in action.

---

*Have questions or run into issues? Feel free to reach out via [email/Twitter/LinkedIn].*
