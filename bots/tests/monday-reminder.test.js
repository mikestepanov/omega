const MondayReminderBot = require('../monday-reminder/monday-reminder');
const { format } = require('date-fns');

// Mock dependencies
jest.mock('../shared/config-loader');
jest.mock('../shared/messaging-factory');
jest.mock('../shared/pay-period-calculator');

const ConfigLoader = require('../shared/config-loader');
const MessagingFactory = require('../shared/messaging-factory');
const PayPeriodCalculator = require('../shared/pay-period-calculator');

describe('MondayReminderBot', () => {
  let bot;
  let mockMessaging;
  let mockPayPeriodCalc;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock messaging client
    mockMessaging = {
      sendMessage: jest.fn().mockResolvedValue({ success: true }),
      formatMessage: jest.fn((title, sections) => {
        return `${title}\n${sections.map(s => s.text).join('\n')}`;
      })
    };

    // Mock config
    ConfigLoader.load.mockReturnValue({
      bot: {
        identity: 'agentsmith',
        name: 'Agent Smith'
      },
      messaging: {
        platform: 'pumble',
        pumble: { apiKey: 'test-key' },
        channels: {
          dev: 'dev-channel-id',
          design: 'design-channel-id'
        }
      }
    });

    // Mock messaging factory
    MessagingFactory.create.mockReturnValue(mockMessaging);

    // Mock pay period calculator
    mockPayPeriodCalc = {
      isLastDayOfPeriod: jest.fn(),
      getCurrentPeriodInfo: jest.fn(),
      generateBotFormattedMessage: jest.fn()
    };
    PayPeriodCalculator.mockImplementation(() => mockPayPeriodCalc);

    bot = new MondayReminderBot();
  });

  describe('Initialization', () => {
    test('should initialize with correct configuration', () => {
      expect(ConfigLoader.load).toHaveBeenCalled();
      expect(MessagingFactory.create).toHaveBeenCalledWith(
        'pumble',
        { apiKey: 'test-key' },
        { enableNotifications: true }
      );
      expect(PayPeriodCalculator).toHaveBeenCalledWith({
        basePeriodNumber: 18,
        basePeriodEndDate: expect.any(Date),
        periodLengthDays: 14,
        paymentDelayDays: 7
      });
    });
  });

  describe('Send Monday Reminder', () => {
    const mockPeriodInfo = {
      currentPeriod: {
        number: 19,
        startDate: new Date('2025-06-24'),
        endDate: new Date('2025-07-07'),
        paymentDate: new Date('2025-07-14')
      },
      nextPeriod: {
        number: 20,
        startDate: new Date('2025-07-08')
      }
    };

    const mockPeriodData = {
      periodOrdinal: '19th',
      startDate: '6/24',
      endDate: '7/7',
      endDateLong: 'Monday, July 7, 2025',
      tomorrowDate: 'Tuesday, July 8, 2025',
      nextPeriodOrdinal: '20th',
      paymentDate: 'Monday, July 14, 2025'
    };

    beforeEach(() => {
      mockPayPeriodCalc.getCurrentPeriodInfo.mockReturnValue(mockPeriodInfo);
      mockPayPeriodCalc.generateBotFormattedMessage.mockReturnValue(mockPeriodData);
    });

    test('should send reminders on last day of period', async () => {
      mockPayPeriodCalc.isLastDayOfPeriod.mockReturnValue(true);

      const result = await bot.sendMondayReminder();

      expect(mockPayPeriodCalc.isLastDayOfPeriod).toHaveBeenCalled();
      expect(mockMessaging.sendMessage).toHaveBeenCalledTimes(2); // dev and design
      expect(mockMessaging.sendMessage).toHaveBeenCalledWith(
        'dev-channel-id',
        expect.stringContaining('Good Morning Team')
      );
      expect(mockMessaging.sendMessage).toHaveBeenCalledWith(
        'design-channel-id',
        expect.stringContaining('Good Morning Team')
      );
      expect(result.success).toBe(true);
      expect(result.channelsSent).toEqual(['dev', 'design']);
    });

    test('should not send reminders on non-last day', async () => {
      mockPayPeriodCalc.isLastDayOfPeriod.mockReturnValue(false);

      const result = await bot.sendMondayReminder();

      expect(mockMessaging.sendMessage).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    test('should respect test mode', async () => {
      mockPayPeriodCalc.isLastDayOfPeriod.mockReturnValue(false);

      const result = await bot.sendMondayReminder({ testMode: true });

      expect(mockMessaging.sendMessage).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });

    test('should only send to specified channels', async () => {
      mockPayPeriodCalc.isLastDayOfPeriod.mockReturnValue(true);

      const result = await bot.sendMondayReminder({ channels: ['dev'] });

      expect(mockMessaging.sendMessage).toHaveBeenCalledTimes(1);
      expect(mockMessaging.sendMessage).toHaveBeenCalledWith(
        'dev-channel-id',
        expect.any(String)
      );
      expect(result.channelsSent).toEqual(['dev']);
    });

    test('should include extra hours message when enabled', async () => {
      mockPayPeriodCalc.isLastDayOfPeriod.mockReturnValue(true);

      await bot.sendMondayReminder({ includeExtraHours: true });

      expect(mockMessaging.formatMessage).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          expect.objectContaining({
            text: expect.stringContaining('extra hours')
          })
        ])
      );
    });

    test('should exclude extra hours message when disabled', async () => {
      mockPayPeriodCalc.isLastDayOfPeriod.mockReturnValue(true);

      await bot.sendMondayReminder({ includeExtraHours: false });

      const formattedMessage = mockMessaging.formatMessage.mock.calls[0][1];
      const hasExtraHours = formattedMessage.some(section => 
        section.text && section.text.includes('extra hours')
      );
      expect(hasExtraHours).toBe(false);
    });
  });

  describe('Message Content', () => {
    test('should format message with correct period information', async () => {
      mockPayPeriodCalc.isLastDayOfPeriod.mockReturnValue(true);
      mockPayPeriodCalc.getCurrentPeriodInfo.mockReturnValue({
        currentPeriod: { number: 19 },
        nextPeriod: { number: 20 }
      });
      mockPayPeriodCalc.generateBotFormattedMessage.mockReturnValue({
        periodOrdinal: '19th',
        startDate: '6/24',
        endDate: '7/7',
        endDateLong: 'Monday, July 7, 2025',
        tomorrowDate: 'Tuesday, July 8, 2025',
        nextPeriodOrdinal: '20th',
        paymentDate: 'Monday, July 14, 2025'
      });

      await bot.sendMondayReminder();

      const messageCall = mockMessaging.sendMessage.mock.calls[0][1];
      expect(messageCall).toContain('19th pay-period');
      expect(messageCall).toContain('6/24 – 7/7');
      expect(messageCall).toContain('Monday, July 7, 2025');
      expect(messageCall).toContain('20th pay-period');
      expect(messageCall).toContain('Monday, July 14, 2025');
      expect(messageCall).toContain('@here');
    });
  });

  describe('Error Handling', () => {
    test('should handle messaging errors gracefully', async () => {
      mockPayPeriodCalc.isLastDayOfPeriod.mockReturnValue(true);
      mockMessaging.sendMessage
        .mockResolvedValueOnce({ success: true })
        .mockRejectedValueOnce(new Error('Network error'));

      await expect(bot.sendMondayReminder()).rejects.toThrow('Network error');
      expect(mockMessaging.sendMessage).toHaveBeenCalledTimes(2);
    });

    test('should continue sending if one channel fails', async () => {
      // Update config to have 3 channels
      ConfigLoader.load.mockReturnValue({
        bot: { identity: 'agentsmith', name: 'Agent Smith' },
        messaging: {
          platform: 'pumble',
          pumble: { apiKey: 'test-key' },
          channels: {
            dev: 'dev-channel-id',
            design: 'design-channel-id',
            admin: 'admin-channel-id'
          }
        }
      });

      bot = new MondayReminderBot();
      mockPayPeriodCalc.isLastDayOfPeriod.mockReturnValue(true);
      
      // Make design channel fail
      mockMessaging.sendMessage
        .mockImplementation((channelId) => {
          if (channelId === 'design-channel-id') {
            return Promise.reject(new Error('Channel not found'));
          }
          return Promise.resolve({ success: true });
        });

      await expect(bot.sendMondayReminder({ 
        channels: ['dev', 'design', 'admin'] 
      })).rejects.toThrow('Channel not found');

      // Should have attempted all channels
      expect(mockMessaging.sendMessage).toHaveBeenCalledTimes(3);
    });
  });

  describe('Preview Message', () => {
    test('should generate preview without sending', () => {
      const mockDate = new Date('2025-07-07');
      mockPayPeriodCalc.getCurrentPeriodInfo.mockReturnValue({
        currentPeriod: {
          number: 19,
          startDate: new Date('2025-06-24'),
          endDate: new Date('2025-07-07'),
          paymentDate: new Date('2025-07-14')
        }
      });
      mockPayPeriodCalc.generateBotFormattedMessage.mockReturnValue({
        periodOrdinal: '19th',
        startDate: '6/24',
        endDate: '7/7',
        endDateLong: 'Monday, July 7, 2025',
        paymentDate: 'Monday, July 14, 2025'
      });
      mockPayPeriodCalc.isLastDayOfPeriod.mockReturnValue(true);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = bot.previewMessage(mockDate);

      expect(mockMessaging.sendMessage).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('MESSAGE PREVIEW'));
      expect(result.message).toContain('Good Morning Team');
      expect(result.periodInfo).toBeDefined();

      consoleSpy.mockRestore();
    });
  });

  describe('Future Periods', () => {
    test('should show future periods schedule', () => {
      const mockPeriods = [
        { number: 19, startDate: new Date('2025-06-24'), endDate: new Date('2025-07-07'), paymentDate: new Date('2025-07-14') },
        { number: 20, startDate: new Date('2025-07-08'), endDate: new Date('2025-07-21'), paymentDate: new Date('2025-07-28') }
      ];

      mockPayPeriodCalc.getCurrentPeriodInfo
        .mockReturnValueOnce({ 
          currentPeriod: mockPeriods[0], 
          nextPeriod: mockPeriods[1] 
        })
        .mockReturnValueOnce({ 
          currentPeriod: mockPeriods[1], 
          nextPeriod: { startDate: new Date('2025-07-22') } 
        });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      bot.showFuturePeriods(2);

      expect(mockPayPeriodCalc.getCurrentPeriodInfo).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Period 19'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Period 20'));

      consoleSpy.mockRestore();
    });
  });
});