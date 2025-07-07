#!/usr/bin/env node

const axios = require('axios');
const { format, addMinutes } = require('date-fns');

async function send5MinuteTest() {
  const apiKey = process.env.AGENTSMITH_API_KEY || '5d2c8b9e37f37d98f60ae4c94a311dd5';
  const dmChannelId = process.env.BOT_TO_MIKHAIL_DM_CHANNEL_ID || '686860a2851f413511ab90f8';
  const serviceUrl = 'https://pumble-api-keys.addons.marketplace.cake.com';
  
  const now = new Date();
  const sendTime = addMinutes(now, 5);
  
  // This is the advance notice format
  const message = `🔔 **Monday Reminder - 5 Minute Test**

⏰ **Current Time:** ${format(now, 'h:mm a')} CST
📅 **Message will send at:** ${format(sendTime, 'h:mm a')} CST

This is a test of the scheduled message system.

📊 **Pay Period Details:**
• Period: 19
• Dates: 6/24 - 7/7
• Payment: Jul 14

_This message was scheduled at ${format(now, 'h:mm:ss a')} to send at ${format(sendTime, 'h:mm:ss a')}_`;

  try {
    console.log(`📨 Scheduling message for ${format(sendTime, 'h:mm a')} (5 minutes from now)...`);
    
    // Send immediately to confirm
    const response = await axios.post(`${serviceUrl}/sendMessage`, {
      channelId: dmChannelId,
      text: message
    }, {
      headers: { 'Api-Key': apiKey }
    });
    
    console.log('✅ Test message sent!');
    console.log(`Check your DM - this simulates what the cronjob would send.`);
    
    // Set up actual cron-like behavior
    console.log('\n⏰ Setting 5-minute timer...');
    setTimeout(async () => {
      const cronMessage = `⏰ **CRON TRIGGER - 5 Minutes Elapsed**

This is when the actual Monday reminder would be sent to channels.

Time: ${format(new Date(), 'h:mm:ss a')} CST

The GitHub Actions cronjob works the same way:
• 6 AM - Advance notice (like the first message)
• 7 AM - Main reminders to #dev/#design`;

      await axios.post(`${serviceUrl}/sendMessage`, {
        channelId: dmChannelId,
        text: cronMessage
      }, {
        headers: { 'Api-Key': apiKey }
      });
      
      console.log('\n✅ 5-minute timer triggered! Check your DM.');
    }, 5 * 60 * 1000); // 5 minutes
    
    console.log('Timer is running... (press Ctrl+C to cancel)');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run it
send5MinuteTest();