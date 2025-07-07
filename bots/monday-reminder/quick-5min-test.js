#!/usr/bin/env node

const axios = require('axios');
const { format, addMinutes } = require('date-fns');
const PayPeriodCalculator = require('../shared/pay-period-calculator');

async function send5MinuteTest() {
  const apiKey = process.env.AGENTSMITH_API_KEY || '5d2c8b9e37f37d98f60ae4c94a311dd5';
  const dmChannelId = process.env.BOT_TO_MIKHAIL_DM_CHANNEL_ID || '686860a2851f413511ab90f8';
  const serviceUrl = 'https://pumble-api-keys.addons.marketplace.cake.com';
  
  const now = new Date();
  const sendTime = addMinutes(now, 5);
  
  // Generate the EXACT advance notice message
  const advanceMessage = `🔔 **Monday Reminder - 1 Hour Notice**

Good morning! This is a friendly heads-up that Monday timesheet reminders will be sent in 1 hour.

⏰ **Reminders will be sent at:** 7:00 AM CST
📍 **Target Channels:** #dev, #design  
📋 **Type:** Monday Timesheet Reminder

📊 **Pay Period Details:**
• Period: 19
• Dates: 6/24 - 7/7
• Payment: July 14th

_You're receiving this because you're configured as a reminder administrator._`;

  try {
    console.log(`📨 Sending advance notice (what you'd get at 6 AM)...`);
    
    // Send advance notice immediately
    await axios.post(`${serviceUrl}/sendMessage`, {
      channelId: dmChannelId,
      text: advanceMessage
    }, {
      headers: { 'Api-Key': apiKey }
    });
    
    console.log('✅ Advance notice sent!');
    console.log('⏰ In 5 minutes, you\'ll get the main reminder message...');
    
    // Set up 5-minute timer for main message
    setTimeout(async () => {
      // Generate the EXACT main reminder message
      const calculator = new PayPeriodCalculator();
      const mainMessage = calculator.generateReminderMessage({
        teamName: 'Team',
        includeExtraHours: true
      });

      await axios.post(`${serviceUrl}/sendMessage`, {
        channelId: dmChannelId,
        text: `**[This would go to #dev and #design channels]**\n\n${mainMessage}`
      }, {
        headers: { 'Api-Key': apiKey }
      });
      
      console.log('\n✅ Main reminder sent! (This is what channels would receive at 7 AM)');
      process.exit(0);
    }, 5 * 60 * 1000); // 5 minutes
    
    console.log('Timer is running... (press Ctrl+C to cancel)');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run it
send5MinuteTest();