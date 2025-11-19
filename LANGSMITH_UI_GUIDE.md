# LangSmith UI Guide - Finding the Deployment Button

## 🔍 Can't Find "+ New Deployment"?

The LangSmith UI might look different. Here are all the ways to create a deployment:

## Option 1: Look for Different Button Names

The button might be called:
- **"+ New Deployment"**
- **"New Deployment"**
- **"Create Deployment"**
- **"Deploy"**
- **"Add Deployment"**
- Just a **"+"** button

## Option 2: Check These Locations

### Location 1: Deployments Tab
1. Go to: https://smith.langchain.com/
2. Look in the **left sidebar**
3. Find and click **"Deployments"** (might have a rocket 🚀 icon)
4. Look for button in the **top-right corner** of the page

### Location 2: Main Dashboard
1. On the main dashboard page
2. Look for a section called "Deployments"
3. There might be a "Get Started" or "Create" button

### Location 3: Settings or Organization
1. Check if you're in the right organization/workspace
2. Top-right corner: Click your profile/organization name
3. Make sure you're in the correct workspace

## Option 3: Direct URL

Try going directly to the deployment creation page:

**https://smith.langchain.com/o/[YOUR_ORG]/deployments/new**

Or just: **https://smith.langchain.com/deployments**

## 🆕 First Time on LangSmith?

If this is your first time, you might need to:

### Step 1: Complete Onboarding
- LangSmith might have an onboarding flow
- Follow the prompts to set up your organization
- Skip any optional steps

### Step 2: Verify Your Account
- Check your email for verification link
- Click the link to activate your account

### Step 3: Set Up Organization
- You might need to create or join an organization first
- Look for "Create Organization" or similar

## 📸 What the UI Should Look Like

### Typical Layout:

```
┌─────────────────────────────────────────────┐
│  LangSmith                    [Your Profile] │
├───────────────┬─────────────────────────────┤
│               │                              │
│  Projects     │  Deployments Page            │
│  Datasets     │  ┌─────────────────────────┐│
│  Prompts      │  │  + New Deployment      │││
│  Deployments  │◀ └─────────────────────────┘││
│  Settings     │                              │
│               │  Your Deployments:           │
│               │  (empty or list here)        │
└───────────────┴─────────────────────────────┘
```

## 🔄 Alternative: Use LangSmith CLI (Beta)

If the web UI isn't working, you can try the CLI:

```bash
# Install LangSmith CLI
pip install -U langsmith-cli

# Login
langsmith login

# Deploy
langsmith deploy --config backend/langgraph.json
```

**Note**: This might not work yet as the feature is in beta.

## 💡 Common Issues

### Issue 1: Not Seeing "Deployments" Tab
**Solution**: 
- You might need to enable it in your account
- Go to Settings → Features
- Enable "LangGraph Cloud" or "Deployments"

### Issue 2: "Deployments" is Grayed Out
**Solution**:
- Your account might not have access yet
- LangGraph Cloud is in beta - you might need to request access
- Try clicking anyway - it might work

### Issue 3: Different UI Version
LangSmith UI changes frequently. Look for:
- Any button related to "Deploy", "Create", or "New"
- A "+" icon anywhere on the deployments page
- A "Get Started" section

## 📞 What to Look For

Can you tell me what you see?

1. **Are you on the Deployments page?**
   - URL should be like: `https://smith.langchain.com/.../deployments`

2. **What do you see on the page?**
   - Empty state with "Get Started"?
   - List of existing deployments?
   - Something else?

3. **What's in the left sidebar?**
   - Do you see "Deployments" option?
   - Is it clickable?

4. **Any prompts or popups?**
   - Onboarding flow?
   - Feature announcement?

## 🎯 Quick Troubleshooting

Try these steps:

1. **Refresh the page**: Ctrl+F5 or Cmd+Shift+R

2. **Check URL**: Make sure you're at:
   ```
   https://smith.langchain.com/
   ```

3. **Try different paths**:
   - https://smith.langchain.com/deployments
   - https://smith.langchain.com/o/[your-org]/deployments

4. **Check browser console**: 
   - Press F12
   - Look for any errors (red text)

5. **Try different browser**:
   - Chrome, Firefox, or Edge
   - Disable ad blockers

## 📧 Can't Find It?

Take a screenshot of what you see and describe:
1. What page are you on?
2. What options do you see?
3. Any buttons visible?

I'll help you navigate based on what you're seeing!

## 🔗 Useful Links

- **LangSmith Docs**: https://docs.smith.langchain.com/
- **LangGraph Cloud Docs**: https://langchain-ai.github.io/langgraph/cloud/
- **Discord Support**: https://discord.gg/langchain

---

**Tell me what you see and I'll guide you through it!** 🙏

