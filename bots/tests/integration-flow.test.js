const ComplianceBot = require('../kimai/compliance-bot');
const PumbleClient = require('../shared/pumble-client');
const FileStorage = require('../shared/storage/file-storage');
const { parse } = require('csv-parse/sync');

jest.mock('../shared/pumble-client');
jest.mock('../shared/storage/file-storage');
jest.mock('csv-parse/sync');

describe('End-to-End Compliance Flow', () => {
  let bot;
  let mockPumbleClient;
  let mockStorage;
  
  beforeEach(() => {
    mockPumbleClient = {
      sendMessage: jest.fn().mockResolvedValue({ id: 'msg-123' }),
      createGroupChat: jest.fn().mockResolvedValue({ id: 'chat-123' }),
      getChannels: jest.fn().mockResolvedValue([
        { id: 'ch-1', name: 'general' },
        { id: 'ch-2', name: 'compliance' }
      ])
    };
    
    mockStorage = {
      read: jest.fn(),
      write: jest.fn(),
      exists: jest.fn()
    };
    
    PumbleClient.mockImplementation(() => mockPumbleClient);
    FileStorage.mockImplementation(() => mockStorage);
    
    bot = new ComplianceBot({
      pumbleApiKey: 'test-key',
      kimaiUrl: 'https://kimai.test.com',
      kimaiApiKey: 'kimai-key'
    });
  });

  describe('Complete Tuesday Check Flow', () => {
    test('should handle full compliance check with multiple offenders', async () => {
      // Setup: Previous period data exists
      const previousData = [
        { name: 'John Doe', email: 'john@test.com', hours: 160 },
        { name: 'Jane Smith', email: 'jane@test.com', hours: 155 },
        { name: 'Bob Wilson', email: 'bob@test.com', hours: 140 }
      ];
      
      mockStorage.exists.mockResolvedValue(true);
      mockStorage.read.mockResolvedValue(JSON.stringify(previousData));
      
      // Current period - Jane and Bob haven't submitted
      const currentCsv = `name,email,hours
John Doe,john@test.com,160`;
      
      parse.mockReturnValue([
        { name: 'John Doe', email: 'john@test.com', hours: '160' }
      ]);
      
      // Run Tuesday check
      await bot.runTuesdayCheck();
      
      // Should create 2 group chats for offenders
      expect(mockPumbleClient.createGroupChat).toHaveBeenCalledTimes(2);
      expect(mockPumbleClient.createGroupChat).toHaveBeenCalledWith(
        expect.arrayContaining(['jane@test.com']),
        'Timesheet Compliance - Jane Smith'
      );
      expect(mockPumbleClient.createGroupChat).toHaveBeenCalledWith(
        expect.arrayContaining(['bob@test.com']),
        'Timesheet Compliance - Bob Wilson'
      );
      
      // Should send compliance messages
      const sentMessages = mockPumbleClient.sendMessage.mock.calls;
      const complianceMessages = sentMessages.filter(call => 
        call[1].includes('have not submitted')
      );
      expect(complianceMessages).toHaveLength(2);
    });

    test('should handle edge case where everyone is compliant', async () => {
      const compliantData = [
        { name: 'John Doe', email: 'john@test.com', hours: 160 },
        { name: 'Jane Smith', email: 'jane@test.com', hours: 160 }
      ];
      
      mockStorage.exists.mockResolvedValue(true);
      mockStorage.read.mockResolvedValue(JSON.stringify(compliantData));
      
      const currentCsv = `name,email,hours
John Doe,john@test.com,160
Jane Smith,jane@test.com,160`;
      
      parse.mockReturnValue(compliantData);
      
      await bot.runTuesdayCheck();
      
      // No group chats created
      expect(mockPumbleClient.createGroupChat).not.toHaveBeenCalled();
      
      // Should send all-clear message
      const sentMessages = mockPumbleClient.sendMessage.mock.calls;
      const clearMessage = sentMessages.find(call => 
        call[1].includes('All users have submitted')
      );
      expect(clearMessage).toBeDefined();
    });

    test('should handle new employees gracefully', async () => {
      const previousData = [
        { name: 'John Doe', email: 'john@test.com', hours: 160 }
      ];
      
      mockStorage.exists.mockResolvedValue(true);
      mockStorage.read.mockResolvedValue(JSON.stringify(previousData));
      
      // New employee appears in current period
      const currentCsv = `name,email,hours
John Doe,john@test.com,160
Jane Smith,jane@test.com,160
New Employee,new@test.com,80`;
      
      parse.mockReturnValue([
        { name: 'John Doe', email: 'john@test.com', hours: '160' },
        { name: 'Jane Smith', email: 'jane@test.com', hours: '160' },
        { name: 'New Employee', email: 'new@test.com', hours: '80' }
      ]);
      
      await bot.runTuesdayCheck();
      
      // Should not flag new employees as non-compliant
      expect(mockPumbleClient.createGroupChat).not.toHaveBeenCalled();
      
      // Should update stored data with new employees
      const storedData = JSON.parse(mockStorage.write.mock.calls[0][1]);
      expect(storedData).toHaveLength(3);
      expect(storedData.find(u => u.email === 'new@test.com')).toBeDefined();
    });
  });

  describe('User Recheck Flow', () => {
    test('should handle user saying "done" and verify compliance', async () => {
      // User claims they're done
      const userMessage = {
        user: { email: 'jane@test.com' },
        text: '@bot done',
        channel: 'chat-123'
      };
      
      // First check shows non-compliance
      parse.mockReturnValueOnce([
        { name: 'John Doe', email: 'john@test.com', hours: '160' }
        // Jane not in list
      ]);
      
      // After re-extraction, Jane appears
      parse.mockReturnValueOnce([
        { name: 'John Doe', email: 'john@test.com', hours: '160' },
        { name: 'Jane Smith', email: 'jane@test.com', hours: '160' }
      ]);
      
      await bot.handleUserMessage(userMessage);
      
      // Should send re-checking message
      expect(mockPumbleClient.sendMessage).toHaveBeenCalledWith(
        'chat-123',
        expect.stringContaining('Re-extracting')
      );
      
      // Should send success message
      expect(mockPumbleClient.sendMessage).toHaveBeenCalledWith(
        'chat-123',
        expect.stringContaining('Timesheet verified')
      );
    });

    test('should handle false "done" claims', async () => {
      const userMessage = {
        user: { email: 'bob@test.com' },
        text: 'done',
        channel: 'chat-123'
      };
      
      // Both checks show Bob hasn't submitted
      parse.mockReturnValue([
        { name: 'John Doe', email: 'john@test.com', hours: '160' }
      ]);
      
      await bot.handleUserMessage(userMessage);
      
      // Should send failure message
      const failureMessage = mockPumbleClient.sendMessage.mock.calls.find(
        call => call[1].includes('not found') || call[1].includes('still missing')
      );
      expect(failureMessage).toBeDefined();
    });
  });

  describe('Concurrent Request Handling', () => {
    test('should handle multiple users saying "done" simultaneously', async () => {
      const users = Array(10).fill(null).map((_, i) => ({
        user: { email: `user${i}@test.com` },
        text: 'done',
        channel: `chat-${i}`
      }));
      
      // All users are compliant
      const compliantData = users.map((u, i) => ({
        name: `User ${i}`,
        email: u.user.email,
        hours: '160'
      }));
      
      parse.mockReturnValue(compliantData);
      
      // Process all messages concurrently
      await Promise.all(users.map(msg => bot.handleUserMessage(msg)));
      
      // Each user should get their own response
      expect(mockPumbleClient.sendMessage).toHaveBeenCalledTimes(users.length * 2); // checking + result
      
      // Verify responses went to correct channels
      users.forEach((user, i) => {
        const channelMessages = mockPumbleClient.sendMessage.mock.calls.filter(
          call => call[0] === `chat-${i}`
        );
        expect(channelMessages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Recovery', () => {
    test('should handle Pumble API failures gracefully', async () => {
      mockPumbleClient.sendMessage
        .mockRejectedValueOnce(new Error('API rate limit'))
        .mockResolvedValueOnce({ id: 'msg-123' });
      
      const userMessage = {
        user: { email: 'john@test.com' },
        text: 'done',
        channel: 'chat-123'
      };
      
      parse.mockReturnValue([
        { name: 'John Doe', email: 'john@test.com', hours: '160' }
      ]);
      
      await bot.handleUserMessage(userMessage);
      
      // Should retry and eventually succeed
      expect(mockPumbleClient.sendMessage).toHaveBeenCalledTimes(2);
    });

    test('should handle Kimai extraction failures', async () => {
      parse.mockImplementation(() => {
        throw new Error('Invalid CSV format');
      });
      
      await bot.runTuesdayCheck();
      
      // Should send error notification
      const errorMessage = mockPumbleClient.sendMessage.mock.calls.find(
        call => call[1].includes('Error') || call[1].includes('failed')
      );
      expect(errorMessage).toBeDefined();
    });

    test('should handle storage failures', async () => {
      mockStorage.write.mockRejectedValue(new Error('Disk full'));
      
      const data = [
        { name: 'John Doe', email: 'john@test.com', hours: 160 }
      ];
      
      parse.mockReturnValue(data);
      
      // Should continue despite storage failure
      await bot.runTuesdayCheck();
      
      // Should still send notifications
      expect(mockPumbleClient.sendMessage.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('Data Consistency', () => {
    test('should maintain data integrity across period transitions', async () => {
      // Simulate multiple period transitions
      const periods = [
        { period: 1, users: ['john@test.com', 'jane@test.com'] },
        { period: 2, users: ['john@test.com', 'jane@test.com', 'bob@test.com'] },
        { period: 3, users: ['john@test.com', 'bob@test.com'] } // Jane left
      ];
      
      for (const { period, users } of periods) {
        const data = users.map(email => ({
          name: email.split('@')[0],
          email,
          hours: 160
        }));
        
        parse.mockReturnValue(data);
        mockStorage.exists.mockResolvedValue(period > 1);
        
        if (period > 1) {
          const previousPeriod = periods[period - 2];
          const previousData = previousPeriod.users.map(email => ({
            name: email.split('@')[0],
            email,
            hours: 160
          }));
          mockStorage.read.mockResolvedValue(JSON.stringify(previousData));
        }
        
        await bot.runTuesdayCheck();
        
        // Verify correct data is stored
        const storedData = JSON.parse(mockStorage.write.mock.calls[period - 1][1]);
        expect(storedData.length).toBe(users.length);
        expect(storedData.map(u => u.email).sort()).toEqual(users.sort());
      }
    });
  });
});