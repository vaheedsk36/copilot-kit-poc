# GitHub Authentication - Username + Token

## ⚠️ Important: GitHub Doesn't Accept Passwords Anymore

Since August 2021, GitHub requires a **Personal Access Token (PAT)** instead of your password for git operations.

**Good news**: You can still use your username! Just use a token instead of password.

## 🔑 Step-by-Step: Get Your Personal Access Token

### Step 1: Create the Token (2 minutes)

1. **Go to GitHub Token Settings**:
   https://github.com/settings/tokens/new

2. **Fill in the form**:
   - **Note**: `LangSmith Deployment` (or any name you like)
   - **Expiration**: `90 days` (or choose your preference)
   - **Select scopes**:
     - ✅ Check **`repo`** (this gives access to your repositories)
     - That's all you need!

3. **Click "Generate token"** (green button at bottom)

4. **COPY THE TOKEN**:
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Important**: You won't see it again after you leave this page!
   - Save it somewhere safe (like a password manager)

### Step 2: Push Using Username + Token

Now you can push using your GitHub username and the token:

```bash
cd /root/copilot-kit-poc/project-with-copilotkit

# Method 1: Push directly with credentials in URL
git push https://YOUR_USERNAME:YOUR_TOKEN@github.com/vaheedsk36/copilot-kit-poc.git main
```

**Replace**:
- `YOUR_USERNAME` with your GitHub username (e.g., `vaheedsk36`)
- `YOUR_TOKEN` with the token you just copied

**Example**:
```bash
# If your username is "vaheedsk36" and token is "ghp_abc123..."
git push https://vaheedsk36:ghp_abc123...@github.com/vaheedsk36/copilot-kit-poc.git main
```

### Alternative: Save Token in Remote URL

This way you only need to enter it once:

```bash
cd /root/copilot-kit-poc/project-with-copilotkit

# Set the remote URL with your credentials
git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/vaheedsk36/copilot-kit-poc.git

# Now you can push normally
git push -u origin main
```

## 🎯 Quick Copy-Paste Commands

After you get your token from GitHub, run these commands:

```bash
cd /root/copilot-kit-poc/project-with-copilotkit

# Replace YOUR_TOKEN with your actual token
# Your username is already in the URL: vaheedsk36
git remote set-url origin https://vaheedsk36:YOUR_TOKEN@github.com/vaheedsk36/copilot-kit-poc.git

# Push to GitHub
git push -u origin main
```

## 📝 Example (with fake token)

```bash
# Example with fake token (yours will be different)
git remote set-url origin https://vaheedsk36:ghp_1234567890abcdefghijklmnopqrstuv@github.com/vaheedsk36/copilot-kit-poc.git
git push -u origin main
```

## ✅ Verify It Worked

After `git push` succeeds, you should see:

```
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 8 threads
Compressing objects: 100% (5/5), done.
Writing objects: 100% (5/5), done.
Total 5 (delta 0), reused 0 (delta 0), pack-reused 0
To https://github.com/vaheedsk36/copilot-kit-poc.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

## 🔒 Security Note

**Token = Your Password**: Treat it like a password!
- Don't share it
- Don't commit it to git
- Use a password manager to store it
- You can revoke it anytime at: https://github.com/settings/tokens

## ❓ Troubleshooting

### "Authentication failed"
- Check your token is correct (no extra spaces)
- Make sure token hasn't expired
- Verify `repo` scope is checked when creating token

### "Repository not found"
- Check the repository URL is correct
- Make sure you have access to the repository
- Try accessing the repo in your browser first

### Still having issues?
Create a new token with **all repo permissions**:
- Go to: https://github.com/settings/tokens/new
- Check **`repo`** (all sub-options will be checked)
- Generate and try again

## 🎯 Ready?

1. Get token: https://github.com/settings/tokens/new
2. Copy the token
3. Run:
```bash
cd /root/copilot-kit-poc/project-with-copilotkit
git remote set-url origin https://vaheedsk36:YOUR_TOKEN@github.com/vaheedsk36/copilot-kit-poc.git
git push -u origin main
```

That's it! Once pushed, proceed to deploy on LangSmith! 🚀

