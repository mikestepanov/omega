# GitHub Actions Secrets Setup

## How to Add Secrets to Your Repository

1. Go to your GitHub repository: https://github.com/YOUR_USERNAME/omega
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

## Required Secrets for Monday Reminder

Add each of these secrets:

### Messaging Platform Secrets

**For Pumble:**
- `PUMBLE_API_KEY` - Your Pumble API key
- `BOT_EMAIL` - Bot's email address
- `BOT_ID` - Bot's user ID in Pumble
- `MIKHAIL_PUMBLE_ID` - Your Pumble user ID (default: 66908542f1798a06218c1fc5)
- `DEV_CHANNEL_ID` - Dev channel ID (default: 66934de10aeebd36fe26f468)
- `DESIGN_CHANNEL_ID` - Design channel ID (default: 66b6450b791a8769092d6f89)

**For Slack (if using):**
- `SLACK_BOT_TOKEN` - Your Slack bot token
- `SLACK_SIGNING_SECRET` - Slack app signing secret

**For Teams (if using):**
- `TEAMS_WEBHOOK_URL` - Microsoft Teams webhook URL

### Optional Configuration
- `BOT_IDENTITY` - Bot identity name (default: agentsmith)
- `BOT_NAME` - Bot display name (default: Agent Smith)
- `MESSAGING_PLATFORM` - Platform to use (default: pumble)

## Verify GitHub Actions is Working

### 1. Check Workflow Status
- Go to **Actions** tab in your repository
- Look for "Monday Pay Period Reminder"
- Click on it to see run history

### 2. Test Manual Run
- Click **Run workflow** button
- Select **Run workflow** with test_mode checked
- Watch the logs to ensure it completes

### 3. Monitor Scheduled Runs
- Workflow runs every Monday at 7 AM CST
- Check Actions tab on Mondays to verify
- Enable email notifications for failed workflows

## Troubleshooting

### If workflow doesn't appear:
1. Make sure file is in `.github/workflows/`
2. Filename must end with `.yml` or `.yaml`
3. Push changes to GitHub

### If workflow fails:
1. Check the logs in Actions tab
2. Verify all secrets are set correctly
3. Ensure bot script exists at correct path

### To disable workflow:
1. Go to Actions tab
2. Click on the workflow
3. Click **...** menu → **Disable workflow**

## Important Notes

- NO LOCAL CRONJOBS will run (verified: no crontab entries)
- All scheduling happens on GitHub's infrastructure
- Free tier includes 2,000 minutes/month for private repos
- Public repos have unlimited Actions minutes

## Monitoring Best Practices

1. **Set up notifications:**
   - Go to Settings → Notifications
   - Enable "Actions" notifications for failures

2. **Add health checks:**
   - Use a service like healthchecks.io
   - Add curl command after successful run

3. **Review logs regularly:**
   - Check Actions tab weekly
   - Look for any failed runs