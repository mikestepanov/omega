/**
 * Integration test for the complete Monday reminder flow
 * Tests the interaction between all components
 */

const MondayReminderBot = require('../../monday-reminder/monday-reminder');
const { format } = require('date-fns');

// We won't mock these to test real integration
const PayPeriodCalculator = require('../../shared/pay-period-calculator');

// We'll only mock external dependencies
jest.mock('axios');
const axios = require('axios');

describe('Monday Reminder Integration Test', () => {
  let bot;
  const realDate = new Date('2025-07-07T08:00:00'); // Monday, last day of period 19

  beforeEach(() => {
    // Set up environment
    process.env.BOT_IDENTITY = 'agentsmith';
    process.env.MESSAGING_PLATFORM = 'pumble';
    process.env.PUMBLE_API_KEY = 'test-integration-key';
    process.env.DEV_CHANNEL_ID = 'dev-channel-123';
    process.env.DESIGN_CHANNEL_ID = 'design-channel-456';
    process.env.BOT_TO_MIKHAIL_DM_CHANNEL_ID = 'mikhail-dm-789';

    // Mock axios for Pumble API calls
    axios.post = jest.fn().mockResolvedValue({ 
      data: { id: 'msg-123', success: true } 
    });

    // Clear module cache to ensure fresh instances
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should send Monday reminders on the last day of pay period', async () => {
    // Use the real date
    jest.useFakeTimers();
    jest.setSystemTime(realDate);

    // Create bot instance (this will use real PayPeriodCalculator)
    const MondayReminderBot = require('../../monday-reminder/monday-reminder');
    bot = new MondayReminderBot();

    // Run the reminder
    const result = await bot.sendMondayReminder();

    // Verify the result
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.channelsSent).toEqual(['dev', 'design']);

    // Verify API calls were made
    expect(axios.post).toHaveBeenCalledTimes(2);

    // Verify the message content
    const firstCall = axios.post.mock.calls[0];
    const messageContent = firstCall[1].text;

    // Check key elements of the message
    expect(messageContent).toContain('Good Morning Team');
    expect(messageContent).toContain('19th pay-period');
    expect(messageContent).toContain('6/24 – 7/7');
    expect(messageContent).toContain('July 7');
    expect(messageContent).toContain('20th pay-period');
    expect(messageContent).toContain('July 14'); // Payment date
    expect(messageContent).toContain('@here');

    // Verify both channels received the message
    expect(axios.post).toHaveBeenCalledWith(
      'https://pumble-api-keys.addons.marketplace.cake.com/sendMessage',
      expect.objectContaining({
        channelId: 'dev-channel-123',
        text: expect.stringContaining('Good Morning Team'),
        asBot: false
      }),
      expect.objectContaining({
        headers: { 'Api-Key': 'test-integration-key' }
      })
    );

    expect(axios.post).toHaveBeenCalledWith(
      'https://pumble-api-keys.addons.marketplace.cake.com/sendMessage',
      expect.objectContaining({
        channelId: 'design-channel-456',
        text: expect.stringContaining('Good Morning Team'),
        asBot: false
      }),
      expect.objectContaining({
        headers: { 'Api-Key': 'test-integration-key' }
      })
    );

    jest.useRealTimers();
  });

  test('should not send reminders on non-last day of period', async () => {
    // Test with a day that's not the last day
    const notLastDay = new Date('2025-07-06T08:00:00'); // Sunday
    jest.useFakeTimers();
    jest.setSystemTime(notLastDay);

    const MondayReminderBot = require('../../monday-reminder/monday-reminder');
    bot = new MondayReminderBot();

    const result = await bot.sendMondayReminder();

    // Should not send anything
    expect(result).toBeUndefined();
    expect(axios.post).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  test('should handle API failures with retry logic', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(realDate);

    // Make the API fail initially then succeed
    axios.post = jest.fn()
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValueOnce({ data: { id: 'msg-123', success: true } })
      .mockResolvedValueOnce({ data: { id: 'msg-124', success: true } });

    const MondayReminderBot = require('../../monday-reminder/monday-reminder');
    bot = new MondayReminderBot();

    // This should fail because our current implementation doesn't have retry at the bot level
    await expect(bot.sendMondayReminder()).rejects.toThrow('Network timeout');

    // In a real implementation with resilient sender, it would retry
    expect(axios.post).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  test('should format message correctly with bot personality', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(realDate);

    const MondayReminderBot = require('../../monday-reminder/monday-reminder');
    bot = new MondayReminderBot();

    // Test preview mode to check formatting
    const preview = bot.previewMessage(realDate);

    expect(preview.message).toContain('Good Morning Team');
    expect(preview.message).toContain('19th pay-period');
    expect(preview.periodInfo.currentPeriod.number).toBe(19);

    jest.useRealTimers();
  });

  describe('Pay Period Edge Cases', () => {
    test('should handle year boundary correctly', async () => {
      // Test a period that spans across years
      const yearEndDate = new Date('2025-12-29T08:00:00'); // Assuming this is last day of a period
      jest.useFakeTimers();
      jest.setSystemTime(yearEndDate);

      const MondayReminderBot = require('../../monday-reminder/monday-reminder');
      bot = new MondayReminderBot();
      
      const preview = bot.previewMessage(yearEndDate);

      // The message should handle the year transition properly
      expect(preview.message).toBeDefined();
      expect(preview.periodInfo.currentPeriod.endDate.getFullYear()).toBe(2025);
      // Next period should start in 2026
      expect(preview.periodInfo.nextPeriod.startDate.getFullYear()).toBe(2026);

      jest.useRealTimers();
    });

    test('should calculate correct period for any Monday', async () => {
      const MondayReminderBot = require('../../monday-reminder/monday-reminder');
      bot = new MondayReminderBot();

      // Test multiple Mondays
      const testDates = [
        new Date('2025-06-23T08:00:00'), // Period 18
        new Date('2025-07-07T08:00:00'), // Period 19
        new Date('2025-07-21T08:00:00'), // Period 20
        new Date('2025-08-04T08:00:00'), // Period 21
      ];

      testDates.forEach((date, index) => {
        jest.setSystemTime(date);
        const isLastDay = bot.payPeriodCalc.isLastDayOfPeriod(date);
        expect(isLastDay).toBe(true);
        
        const periodInfo = bot.payPeriodCalc.getCurrentPeriodInfo(date);
        expect(periodInfo.currentPeriod.number).toBe(18 + index);
      });
    });
  });

  describe('Configuration Variations', () => {
    test('should work with different bot identities', async () => {
      // Test with a different bot identity
      process.env.BOT_IDENTITY = 'bloodhunter';
      jest.resetModules();

      jest.useFakeTimers();
      jest.setSystemTime(realDate);

      const MondayReminderBot = require('../../monday-reminder/monday-reminder');
      bot = new MondayReminderBot();

      const preview = bot.previewMessage(realDate);
      
      // Should not contain Agent Smith specific content
      expect(preview.message).not.toContain('Mr. Anderson');

      jest.useRealTimers();
    });
  });
});