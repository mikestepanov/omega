const express = require('express');
const request = require('supertest');
const crypto = require('crypto');

// Mock the webhook handler module
jest.mock('../api/webhook-handler', () => {
  const handler = (req, res) => {
    // Simple webhook handler for testing
    if (!req.body) {
      return res.status(400).json({ error: 'No body' });
    }
    
    // Validate signature
    const signature = req.headers['x-webhook-signature'];
    if (!signature) {
      return res.status(401).json({ error: 'Missing signature' });
    }
    
    // Process webhook
    const { event, data } = req.body;
    if (event === 'timesheet.submitted') {
      res.json({ processed: true, timesheetId: data.id });
    } else {
      res.status(400).json({ error: 'Unknown event' });
    }
  };
  
  handler.validateSignature = (payload, signature, secret) => {
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    return signature === expectedSig;
  };
  
  return handler;
});

const webhookHandler = require('../api/webhook-handler');

describe('Webhook Handler Security', () => {
  let app;
  const webhookSecret = 'test-webhook-secret';
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/webhook', webhookHandler);
  });

  describe('Authentication', () => {
    test('should reject requests without signature', async () => {
      const response = await request(app)
        .post('/webhook')
        .send({ event: 'test' });
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Missing signature');
    });

    test('should reject requests with invalid signature', async () => {
      const payload = { event: 'timesheet.submitted', data: { id: 123 } };
      
      const response = await request(app)
        .post('/webhook')
        .set('X-Webhook-Signature', 'invalid-signature')
        .send(payload);
      
      expect(response.status).toBe(401);
    });

    test('should accept requests with valid signature', async () => {
      const payload = { event: 'timesheet.submitted', data: { id: 123 } };
      const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      const response = await request(app)
        .post('/webhook')
        .set('X-Webhook-Signature', signature)
        .send(payload);
      
      expect(response.status).toBe(200);
      expect(response.body.processed).toBe(true);
    });
  });

  describe('Replay Attack Prevention', () => {
    test('should reject old timestamps', async () => {
      const payload = { 
        event: 'timesheet.submitted', 
        data: { id: 123 },
        timestamp: Date.now() - 6 * 60 * 1000 // 6 minutes old
      };
      const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      const response = await request(app)
        .post('/webhook')
        .set('X-Webhook-Signature', signature)
        .send(payload);
      
      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Request too old');
    });

    test('should track and reject duplicate webhook IDs', async () => {
      const payload = { 
        event: 'timesheet.submitted', 
        data: { id: 123 },
        webhookId: 'unique-webhook-123'
      };
      const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      // First request should succeed
      const response1 = await request(app)
        .post('/webhook')
        .set('X-Webhook-Signature', signature)
        .send(payload);
      
      expect(response1.status).toBe(200);
      
      // Duplicate should be rejected
      const response2 = await request(app)
        .post('/webhook')
        .set('X-Webhook-Signature', signature)
        .send(payload);
      
      expect(response2.status).toBe(409);
      expect(response2.body.error).toContain('Duplicate webhook');
    });
  });

  describe('Input Validation', () => {
    test('should reject malformed JSON', async () => {
      const response = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('X-Webhook-Signature', 'any')
        .send('{"invalid": json"}');
      
      expect(response.status).toBe(400);
    });

    test('should reject oversized payloads', async () => {
      const largePayload = { 
        event: 'test',
        data: 'x'.repeat(1024 * 1024) // 1MB of data
      };
      
      const response = await request(app)
        .post('/webhook')
        .set('X-Webhook-Signature', 'any')
        .send(largePayload);
      
      expect(response.status).toBe(413);
    });

    test('should sanitize dangerous payloads', async () => {
      const dangerousPayloads = [
        { event: '../../../etc/passwd' },
        { event: 'test', data: { command: 'rm -rf /' } },
        { event: 'test', data: { sql: "'; DROP TABLE users; --" } },
        { event: 'test', data: { script: '<script>alert("xss")</script>' } }
      ];
      
      for (const payload of dangerousPayloads) {
        const signature = crypto
          .createHmac('sha256', webhookSecret)
          .update(JSON.stringify(payload))
          .digest('hex');
        
        const response = await request(app)
          .post('/webhook')
          .set('X-Webhook-Signature', signature)
          .send(payload);
        
        // Should either reject or sanitize, not execute
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits per IP', async () => {
      const payload = { event: 'timesheet.submitted', data: { id: 123 } };
      const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      // Send many requests rapidly
      const requests = Array(20).fill(null).map(() => 
        request(app)
          .post('/webhook')
          .set('X-Webhook-Signature', signature)
          .set('X-Forwarded-For', '192.168.1.100')
          .send(payload)
      );
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    test('should handle distributed rate limiting', async () => {
      // Different IPs should have separate limits
      const ips = ['192.168.1.1', '192.168.1.2', '192.168.1.3'];
      const payload = { event: 'timesheet.submitted', data: { id: 123 } };
      const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      for (const ip of ips) {
        const response = await request(app)
          .post('/webhook')
          .set('X-Webhook-Signature', signature)
          .set('X-Forwarded-For', ip)
          .send(payload);
        
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Error Handling', () => {
    test('should not leak internal errors', async () => {
      const payload = { event: 'cause-internal-error' };
      const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      const response = await request(app)
        .post('/webhook')
        .set('X-Webhook-Signature', signature)
        .send(payload);
      
      // Should not expose stack traces or internal details
      expect(response.body).not.toContain('Error:');
      expect(response.body).not.toContain('at ');
      expect(response.body).not.toContain('/home/');
    });

    test('should handle database connection failures gracefully', async () => {
      // Mock a database failure scenario
      const payload = { event: 'timesheet.submitted', data: { id: 123 } };
      const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      // Simulate DB down
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const response = await request(app)
        .post('/webhook')
        .set('X-Webhook-Signature', signature)
        .send(payload);
      
      expect(response.status).toBe(503);
      expect(response.body.error).toBe('Service temporarily unavailable');
    });
  });

  describe('SSRF Prevention', () => {
    test('should block internal network requests', async () => {
      const internalUrls = [
        'http://localhost/admin',
        'http://127.0.0.1:8080',
        'http://[::1]/internal',
        'http://169.254.169.254/', // AWS metadata
        'http://10.0.0.1/private',
        'http://192.168.1.1/router'
      ];
      
      for (const url of internalUrls) {
        const payload = { 
          event: 'fetch.url',
          data: { url }
        };
        const signature = crypto
          .createHmac('sha256', webhookSecret)
          .update(JSON.stringify(payload))
          .digest('hex');
        
        const response = await request(app)
          .post('/webhook')
          .set('X-Webhook-Signature', signature)
          .send(payload);
        
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid URL');
      }
    });
  });
});