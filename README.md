# Accessing and Updating all/docs GUIDE

## Step 1: Get the all/docs Branch Locally
If you haven't access this file yet. 'Fetch' this branch 

Switch to all/docs: 
```
git fetch origin
git checkout all/docs
git pull origin all/docs
```

## Step 2: Adding Your Prompt Logs or editing daily standup
**IMPORTANT:** Don't Touch Other Files! Only edit files inside the promptlogs/ or docs/ folders. Do not delete the .github/ folder or the README.md.

## Step 3: Direct Push to GitHub

```
git add [your edited file]
git commit -m "docs: [message] [Your Name]"
git push origin all/docs
```
## Step 4: Go Back to Coding

Once your logs are pushed, switch back to your feature branch to continue working on the app:
```
git checkout feat/your-current-task
```

push your edited promptlogs every after a sprint is done, or whenever you prompt to ai.

## NOTE:
Each role that has a Docs to be edited or add. MUST edit their Corresponding Docs based on their ROLE. 

