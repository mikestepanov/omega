const PumbleClient = require('../shared/pumble-client');
const axios = require('axios');

jest.mock('axios');

describe('PumbleClient Security & Edge Cases', () => {
  let client;
  
  beforeEach(() => {
    client = new PumbleClient({
      apiKey: 'test-key',
      botEmail: 'bot@test.com',
      botId: 'bot-123'
    });
    jest.clearAllMocks();
  });

  describe('Message Security', () => {
    test('should prevent XSS in messages', async () => {
      const xssAttempts = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<iframe src="javascript:alert(\'XSS\')">',
        '<<SCRIPT>alert("XSS");//<</SCRIPT>'
      ];

      for (const payload of xssAttempts) {
        axios.post.mockResolvedValueOnce({ data: { id: 'msg-1' } });
        
        await client.sendMessage('channel-1', payload);
        
        const sentMessage = axios.post.mock.calls[0][1].text;
        expect(sentMessage).not.toContain('<script>');
        expect(sentMessage).not.toContain('javascript:');
        expect(sentMessage).not.toContain('onerror=');
      }
    });

    test('should handle message size limits', async () => {
      const largeMessage = 'A'.repeat(10000); // 10KB message
      
      axios.post.mockRejectedValueOnce({
        response: { status: 413, data: { error: 'Message too large' } }
      });

      await expect(client.sendMessage('channel-1', largeMessage))
        .rejects.toThrow('Message too large');
    });

    test('should validate channel IDs', async () => {
      const invalidChannelIds = [
        '../etc/passwd',
        '../../sensitive-channel',
        'channel-1; DROP TABLE users;--',
        null,
        undefined,
        '',
        ' '
      ];

      for (const channelId of invalidChannelIds) {
        await expect(client.sendMessage(channelId, 'test'))
          .rejects.toThrow(/Invalid channel/);
      }
    });
  });

  describe('API Key Security', () => {
    test('should not expose API key in errors', async () => {
      axios.post.mockRejectedValueOnce(new Error('Request failed'));

      try {
        await client.sendMessage('channel-1', 'test');
      } catch (error) {
        expect(error.message).not.toContain('test-key');
        expect(JSON.stringify(error)).not.toContain('test-key');
      }
    });

    test('should handle invalid API key format', () => {
      const invalidKeys = [
        '',
        ' ',
        'key with spaces',
        'key\nwith\nnewlines',
        '<script>alert("xss")</script>'
      ];

      invalidKeys.forEach(key => {
        expect(() => new PumbleClient({ apiKey: key }))
          .toThrow('Invalid API key format');
      });
    });
  });

  describe('Rate Limiting', () => {
    test('should respect rate limits', async () => {
      const messages = Array(10).fill('test message');
      let callCount = 0;

      axios.post.mockImplementation(() => {
        callCount++;
        if (callCount > 5) {
          return Promise.reject({
            response: { 
              status: 429, 
              headers: { 'x-rate-limit-retry-after': '60' }
            }
          });
        }
        return Promise.resolve({ data: { id: `msg-${callCount}` } });
      });

      const promises = messages.map((msg, i) => 
        client.sendMessage(`channel-${i}`, msg)
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      expect(successful).toHaveLength(5);
      expect(failed).toHaveLength(5);
    });
  });

  describe('Channel Operations', () => {
    test('should handle non-existent channels gracefully', async () => {
      axios.post.mockRejectedValueOnce({
        response: { status: 404, data: { error: 'Channel not found' } }
      });

      await expect(client.sendMessage('non-existent', 'test'))
        .rejects.toThrow('Channel not found');
    });

    test('should handle permission errors', async () => {
      axios.post.mockRejectedValueOnce({
        response: { status: 403, data: { error: 'No permission to post' } }
      });

      await expect(client.sendMessage('private-channel', 'test'))
        .rejects.toThrow('No permission');
    });

    test('should cache channel lookups to prevent DoS', async () => {
      axios.get.mockResolvedValue({ data: [
        { id: 'ch-1', name: 'general' },
        { id: 'ch-2', name: 'dev' }
      ]});

      // Call getChannels multiple times
      await Promise.all([
        client.getChannels(),
        client.getChannels(),
        client.getChannels(),
        client.getChannels(),
        client.getChannels()
      ]);

      // Should only make one API call due to caching
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('Webhook Security', () => {
    test('should validate webhook signatures', () => {
      const payload = { event: 'message_created' };
      const validSignature = client.generateWebhookSignature(payload);
      const invalidSignature = 'invalid-signature';

      expect(client.validateWebhookSignature(payload, validSignature)).toBe(true);
      expect(client.validateWebhookSignature(payload, invalidSignature)).toBe(false);
    });

    test('should reject replay attacks', () => {
      const payload = { 
        event: 'message_created',
        timestamp: Date.now() - 6 * 60 * 1000 // 6 minutes old
      };
      const signature = client.generateWebhookSignature(payload);

      expect(() => client.validateWebhookRequest(payload, signature))
        .toThrow('Request too old');
    });
  });

  describe('Error Handling', () => {
    test('should handle network partitions', async () => {
      axios.post
        .mockRejectedValueOnce(new Error('ENETUNREACH'))
        .mockRejectedValueOnce(new Error('ENETUNREACH'))
        .mockResolvedValueOnce({ data: { id: 'msg-1' } });

      const result = await client.sendMessage('channel-1', 'test');
      expect(result.id).toBe('msg-1');
      expect(axios.post).toHaveBeenCalledTimes(3);
    });

    test('should handle partial responses', async () => {
      axios.post.mockImplementation(() => {
        return new Promise((resolve) => {
          // Simulate partial response
          setTimeout(() => {
            resolve({ data: { /* missing id */ } });
          }, 10);
        });
      });

      await expect(client.sendMessage('channel-1', 'test'))
        .rejects.toThrow('Invalid response');
    });
  });

  describe('Memory Leaks', () => {
    test('should not leak memory with event listeners', () => {
      const initialListenerCount = process.listenerCount('uncaughtException');
      
      // Create and destroy multiple clients
      for (let i = 0; i < 100; i++) {
        const tempClient = new PumbleClient({ apiKey: 'test' });
        tempClient.destroy?.(); // If cleanup method exists
      }

      const finalListenerCount = process.listenerCount('uncaughtException');
      expect(finalListenerCount).toBe(initialListenerCount);
    });
  });
});