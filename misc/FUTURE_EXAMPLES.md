# Future Pay Period Examples

## Next 3 Months Schedule

### July 2025

**Period 19: June 24 - July 7**
- 📧 **Monday, July 7** at 7 AM: Reminder sent
- 💰 **Monday, July 14**: Payment processed

**Period 20: July 8 - July 21**
- 📧 **Monday, July 21** at 7 AM: Reminder sent
- 💰 **Monday, July 28**: Payment processed

### August 2025

**Period 21: July 22 - August 4**
- 📧 **Monday, August 4** at 7 AM: Reminder sent
- 💰 **Monday, August 11**: Payment processed

**Period 22: August 5 - August 18**
- 📧 **Monday, August 18** at 7 AM: Reminder sent
- 💰 **Monday, August 25**: Payment processed

### September 2025

**Period 23: August 19 - September 1**
- 📧 **Monday, September 1** at 7 AM: Reminder sent
- 💰 **Monday, September 8**: Payment processed

**Period 24: September 2 - September 15**
- 📧 **Monday, September 15** at 7 AM: Reminder sent
- 💰 **Monday, September 22**: Payment processed

## Example Message - August 4, 2025

```
🕴️ System Notice: Pay Period 21st Termination

Good Morning Team.

The current pay period cycle reaches its inevitable termination today.

System Requirements:
• Submit all temporal data by end of day today (August 4th)
• Current cycle encompasses: 7/22 – 8/4
• Today (August 4th) is the final day of period 21
• Tomorrow (August 5th) initiates period 22

Additional Directives:
• Those assigned supplementary hours must include them in current submissions
• All entries require proper documentation and categorization

Processing Timeline:
• Payment transmission scheduled: August 11th
• System processing is automatic and inevitable

Compliance is not optional. Direct queries to management if clarification is required.

~ Agent Smith
```

## Key Pattern

The system follows a predictable 14-day cycle:

1. **Every Other Monday**: Reminder sent at 7 AM CST
2. **Same Day**: Last day to submit timesheets (end of day)
3. **Next Day (Tuesday)**: New pay period begins
4. **Following Monday**: Payment processed (7 days later)

## Full Year 2025 Reminder Dates

| Month | Reminder Dates | Period Numbers |
|-------|----------------|----------------|
| June | 23 | 18 |
| July | 7, 21 | 19, 20 |
| August | 4, 18 | 21, 22 |
| September | 1, 15, 29 | 23, 24, 25 |
| October | 13, 27 | 26, 27 |
| November | 10, 24 | 28, 29 |
| December | 8, 22 | 30, 31 |

## Holiday Considerations

When Monday is a holiday, the reminder still sends at 7 AM, giving employees the holiday to complete submissions if needed. The system doesn't adjust for holidays - it maintains the strict 14-day cycle.

## Testing Future Dates

To preview any future Monday's message:
```bash
node monday-reminder.js preview 2025-08-04
```

To see the next 10 pay periods:
```bash
node monday-reminder.js schedule 10
```