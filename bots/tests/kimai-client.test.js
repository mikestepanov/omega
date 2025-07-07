const KimaiClient = require('../shared/kimai-client');
const axios = require('axios');

jest.mock('axios');

describe('KimaiClient', () => {
  let client;
  
  beforeEach(() => {
    client = new KimaiClient({
      baseUrl: 'https://kimai.test.com',
      apiKey: 'test-api-key'
    });
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    test('should handle authentication failures', async () => {
      axios.get.mockRejectedValueOnce({
        response: { status: 401, data: { message: 'Invalid API key' } }
      });

      await expect(client.getTimesheets()).rejects.toThrow('Authentication failed');
    });

    test('should retry on token expiration', async () => {
      axios.get
        .mockRejectedValueOnce({ response: { status: 401 } })
        .mockResolvedValueOnce({ data: { token: 'new-token' } })
        .mockResolvedValueOnce({ data: [] });

      const result = await client.getTimesheets();
      expect(axios.get).toHaveBeenCalledTimes(3);
      expect(result).toEqual([]);
    });
  });

  describe('Network Errors', () => {
    test('should handle network timeouts', async () => {
      axios.get.mockRejectedValueOnce(new Error('ETIMEDOUT'));

      await expect(client.getTimesheets()).rejects.toThrow('Network timeout');
    });

    test('should handle DNS failures', async () => {
      axios.get.mockRejectedValueOnce(new Error('ENOTFOUND'));

      await expect(client.getTimesheets()).rejects.toThrow('Service not found');
    });

    test('should handle connection refused', async () => {
      axios.get.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      await expect(client.getTimesheets()).rejects.toThrow('Connection refused');
    });
  });

  describe('Data Validation', () => {
    test('should handle malformed JSON responses', async () => {
      axios.get.mockResolvedValueOnce({ data: 'invalid json' });

      await expect(client.getTimesheets()).rejects.toThrow('Invalid response format');
    });

    test('should handle empty responses', async () => {
      axios.get.mockResolvedValueOnce({ data: null });

      const result = await client.getTimesheets();
      expect(result).toEqual([]);
    });

    test('should sanitize CSV data to prevent injection', async () => {
      const maliciousData = [
        { description: '=1+1', hours: 8 },
        { description: '@SUM(A1:A10)', hours: 8 },
        { description: '+1234567890', hours: 8 }
      ];

      axios.get.mockResolvedValueOnce({ data: maliciousData });

      const csv = await client.exportToCSV();
      expect(csv).not.toContain('=1+1');
      expect(csv).not.toContain('@SUM');
      expect(csv).not.toContain('+1234567890');
      expect(csv).toContain("'=1+1'"); // Should be escaped
    });
  });

  describe('Rate Limiting', () => {
    test('should handle rate limit errors with retry', async () => {
      const rateLimitResponse = {
        response: { 
          status: 429, 
          headers: { 'retry-after': '2' }
        }
      };

      axios.get
        .mockRejectedValueOnce(rateLimitResponse)
        .mockResolvedValueOnce({ data: [] });

      jest.useFakeTimers();
      const promise = client.getTimesheets();
      
      // Fast-forward time
      jest.advanceTimersByTime(2000);
      await Promise.resolve(); // Let promises resolve
      
      const result = await promise;
      expect(result).toEqual([]);
      expect(axios.get).toHaveBeenCalledTimes(2);
      
      jest.useRealTimers();
    });
  });

  describe('Pagination', () => {
    test('should handle paginated responses', async () => {
      axios.get
        .mockResolvedValueOnce({ 
          data: Array(50).fill({ id: 1 }),
          headers: { 'x-total-pages': '3', 'x-page': '1' }
        })
        .mockResolvedValueOnce({ 
          data: Array(50).fill({ id: 2 }),
          headers: { 'x-total-pages': '3', 'x-page': '2' }
        })
        .mockResolvedValueOnce({ 
          data: Array(20).fill({ id: 3 }),
          headers: { 'x-total-pages': '3', 'x-page': '3' }
        });

      const result = await client.getTimesheets();
      expect(result).toHaveLength(120);
      expect(axios.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very large responses', async () => {
      const largeData = Array(10000).fill({ 
        id: 1, 
        description: 'A'.repeat(1000) 
      });
      
      axios.get.mockResolvedValueOnce({ data: largeData });

      const result = await client.getTimesheets();
      expect(result).toHaveLength(10000);
    });

    test('should handle special characters in data', async () => {
      const specialData = [
        { description: 'Work on "quoted" task', hours: 8 },
        { description: 'Line1\nLine2\nLine3', hours: 8 },
        { description: 'Tab\there', hours: 8 },
        { description: 'Comma, separated, values', hours: 8 }
      ];

      axios.get.mockResolvedValueOnce({ data: specialData });

      const csv = await client.exportToCSV();
      expect(csv).toContain('"Work on ""quoted"" task"');
      expect(csv).toContain('"Line1\\nLine2\\nLine3"');
    });
  });
});