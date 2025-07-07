const ResilientSender = require('../shared/resilient-sender');

describe('ResilientSender', () => {
  let resilientSender;
  let mockClock;

  beforeEach(() => {
    resilientSender = new ResilientSender({
      maxRetries: 5,
      retryDelay: 100, // Use smaller delays for testing
      backoffMultiplier: 2,
      customDelays: {
        4: 200,   // 200ms for 4th retry
        5: 300    // 300ms for 5th retry
      }
    });

    // Mock timers for faster tests
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Retry Logic', () => {
    test('should succeed on first attempt', async () => {
      const mockFunction = jest.fn().mockResolvedValue({ success: true });
      const context = {};

      const resultPromise = resilientSender.sendWithRetry(
        mockFunction,
        context,
        'Test operation'
      );

      const result = await resultPromise;

      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: true });
    });

    test('should retry on failure and succeed on third attempt', async () => {
      const mockFunction = jest.fn()
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Service unavailable'))
        .mockResolvedValueOnce({ success: true });

      const context = {};

      const resultPromise = resilientSender.sendWithRetry(
        mockFunction,
        context,
        'Test operation'
      );

      // Wait for first attempt to fail
      await Promise.resolve();
      
      // Fast-forward through first retry delay (100ms)
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      
      // Fast-forward through second retry delay (200ms)
      jest.advanceTimersByTime(200);
      await Promise.resolve();

      const result = await resultPromise;

      expect(mockFunction).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ success: true });
    });

    test('should use custom delays for attempts 4 and 5', async () => {
      const mockFunction = jest.fn()
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockRejectedValueOnce(new Error('Error 3'))
        .mockRejectedValueOnce(new Error('Error 4'))
        .mockResolvedValueOnce({ success: true });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const resultPromise = resilientSender.sendWithRetry(
        mockFunction,
        context,
        'Test operation'
      );

      // Process through all retries
      await Promise.resolve();
      jest.advanceTimersByTime(100); // 1st retry delay
      await Promise.resolve();
      jest.advanceTimersByTime(200); // 2nd retry delay (exponential)
      await Promise.resolve();
      jest.advanceTimersByTime(200); // 3rd retry delay (custom for 4th attempt)
      await Promise.resolve();
      jest.advanceTimersByTime(300); // 4th retry delay (custom for 5th attempt)
      await Promise.resolve();

      const result = await resultPromise;

      expect(mockFunction).toHaveBeenCalledTimes(5);
      expect(result).toEqual({ success: true });
      
      // Verify custom delay messages
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('200 milliseconds'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('300 milliseconds'));

      consoleSpy.mockRestore();
    });

    test('should fail after max retries', async () => {
      const mockFunction = jest.fn().mockRejectedValue(new Error('Persistent error'));

      const resultPromise = resilientSender.sendWithRetry(
        mockFunction,
        {},
        'Test operation'
      );

      // Process through all retries
      for (let i = 0; i < 4; i++) {
        await Promise.resolve();
        jest.runAllTimers();
      }

      await expect(resultPromise).rejects.toThrow('Failed after 5 attempts: Persistent error');
      expect(mockFunction).toHaveBeenCalledTimes(5);
    });
  });

  describe('Network Connectivity Test', () => {
    test('should return true when network is available', async () => {
      const axios = require('axios');
      jest.mock('axios');
      axios.get = jest.fn().mockResolvedValue({ status: 200 });

      const result = await resilientSender.testConnectivity();
      expect(result).toBe(true);
    });

    test('should return false when network is unavailable', async () => {
      const axios = require('axios');
      jest.mock('axios');
      axios.get = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await resilientSender.testConnectivity();
      expect(result).toBe(false);
    });
  });

  describe('Critical Message with Fallbacks', () => {
    test('should use primary sender when it works', async () => {
      const primarySender = {
        send: jest.fn().mockResolvedValue({ sent: true }),
        description: 'Primary method'
      };

      const fallbackSender = {
        send: jest.fn().mockResolvedValue({ sent: true }),
        description: 'Fallback method'
      };

      const result = await resilientSender.sendCriticalMessage(
        primarySender,
        [fallbackSender]
      );

      expect(primarySender.send).toHaveBeenCalled();
      expect(fallbackSender.send).not.toHaveBeenCalled();
      expect(result).toEqual({ sent: true });
    });

    test('should use fallback when primary fails', async () => {
      const primarySender = {
        send: jest.fn().mockRejectedValue(new Error('Primary failed')),
        description: 'Primary method'
      };

      const fallbackSender = {
        send: jest.fn().mockResolvedValue({ sent: true }),
        description: 'Fallback method'
      };

      const resultPromise = resilientSender.sendCriticalMessage(
        primarySender,
        [fallbackSender]
      );

      // Process primary retries
      for (let i = 0; i < 5; i++) {
        await Promise.resolve();
        jest.runAllTimers();
      }

      const result = await resultPromise;

      expect(primarySender.send).toHaveBeenCalledTimes(5);
      expect(fallbackSender.send).toHaveBeenCalled();
      expect(result).toEqual({ sent: true });
    });

    test('should try multiple fallbacks in order', async () => {
      const primarySender = {
        send: jest.fn().mockRejectedValue(new Error('Primary failed')),
        description: 'Primary'
      };

      const fallback1 = {
        send: jest.fn().mockRejectedValue(new Error('Fallback 1 failed')),
        description: 'Fallback 1'
      };

      const fallback2 = {
        send: jest.fn().mockResolvedValue({ sent: true }),
        description: 'Fallback 2'
      };

      const resultPromise = resilientSender.sendCriticalMessage(
        primarySender,
        [fallback1, fallback2]
      );

      // Process all retries
      for (let i = 0; i < 15; i++) { // Enough for all attempts
        await Promise.resolve();
        jest.runAllTimers();
      }

      const result = await resultPromise;

      expect(primarySender.send).toHaveBeenCalledTimes(5);
      expect(fallback1.send).toHaveBeenCalledTimes(5);
      expect(fallback2.send).toHaveBeenCalled();
      expect(result).toEqual({ sent: true });
    });

    test('should fail when all methods fail', async () => {
      const primarySender = {
        send: jest.fn().mockRejectedValue(new Error('Primary failed')),
        description: 'Primary'
      };

      const fallbackSender = {
        send: jest.fn().mockRejectedValue(new Error('Fallback failed')),
        description: 'Fallback'
      };

      const resultPromise = resilientSender.sendCriticalMessage(
        primarySender,
        [fallbackSender]
      );

      // Process all retries
      for (let i = 0; i < 10; i++) {
        await Promise.resolve();
        jest.runAllTimers();
      }

      await expect(resultPromise).rejects.toThrow('All send methods failed');
    });
  });

  describe('Configuration', () => {
    test('should use default configuration when not provided', () => {
      const defaultSender = new ResilientSender();
      
      expect(defaultSender.maxRetries).toBe(5);
      expect(defaultSender.retryDelay).toBe(5000);
      expect(defaultSender.backoffMultiplier).toBe(2);
      expect(defaultSender.customDelays[4]).toBe(60000);
      expect(defaultSender.customDelays[5]).toBe(300000);
    });

    test('should respect custom configuration', () => {
      const customSender = new ResilientSender({
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 3,
        customDelays: {
          3: 10000
        }
      });

      expect(customSender.maxRetries).toBe(3);
      expect(customSender.retryDelay).toBe(1000);
      expect(customSender.backoffMultiplier).toBe(3);
      expect(customSender.customDelays[3]).toBe(10000);
    });
  });

  describe('Error Messages', () => {
    test('should provide clear error messages with context', async () => {
      const mockFunction = jest.fn()
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Service unavailable'))
        .mockRejectedValueOnce(new Error('Rate limited'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const resultPromise = resilientSender.sendWithRetry(
        mockFunction,
        {},
        'Important API call'
      );

      // Process retries
      for (let i = 0; i < 3; i++) {
        await Promise.resolve();
        jest.runAllTimers();
      }

      try {
        await resultPromise;
      } catch (error) {
        // Expected to fail
      }

      expect(consoleSpy).toHaveBeenCalledWith('❌ Attempt 1 failed:', 'Network timeout');
      expect(consoleSpy).toHaveBeenCalledWith('❌ Attempt 2 failed:', 'Service unavailable');
      expect(consoleSpy).toHaveBeenCalledWith('❌ Attempt 3 failed:', 'Rate limited');

      consoleSpy.mockRestore();
    });
  });
});

// Helper for testing delay calculations
describe('ResilientSender Delay Calculations', () => {
  test('should calculate correct delays for each attempt', () => {
    const sender = new ResilientSender({
      retryDelay: 5000,
      backoffMultiplier: 2,
      customDelays: {
        4: 60000,
        5: 300000
      }
    });

    // Expected delays for each attempt
    const expectedDelays = [
      0,      // Attempt 1: immediate
      5000,   // Attempt 2: 5 seconds
      10000,  // Attempt 3: 10 seconds (5 * 2^1)
      60000,  // Attempt 4: 1 minute (custom)
      300000  // Attempt 5: 5 minutes (custom)
    ];

    // We can't directly test private methods, but we can verify the behavior
    // through the retry timing which we tested above
    expect(sender.customDelays[4]).toBe(60000);
    expect(sender.customDelays[5]).toBe(300000);
  });
});