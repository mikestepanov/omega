const PayPeriodCalculator = require('../shared/pay-period-calculator');
const { format, parseISO } = require('date-fns');

describe('PayPeriodCalculator', () => {
  let calculator;

  beforeEach(() => {
    // Initialize with known base period
    calculator = new PayPeriodCalculator({
      basePeriodNumber: 18,
      basePeriodEndDate: new Date('2025-06-23T12:00:00'),
      periodLengthDays: 14,
      paymentDelayDays: 7
    });
  });

  describe('Period Calculations', () => {
    test('should calculate current period correctly', () => {
      const testDate = new Date('2025-06-23T10:00:00'); // Last day of period 18
      const result = calculator.getCurrentPeriodInfo(testDate);
      
      expect(result.currentPeriod.number).toBe(18);
      expect(format(result.currentPeriod.startDate, 'yyyy-MM-dd')).toBe('2025-06-10');
      expect(format(result.currentPeriod.endDate, 'yyyy-MM-dd')).toBe('2025-06-23');
    });

    test('should calculate next period correctly', () => {
      const testDate = new Date('2025-06-24T10:00:00'); // First day of period 19
      const result = calculator.getCurrentPeriodInfo(testDate);
      
      expect(result.currentPeriod.number).toBe(19);
      expect(format(result.currentPeriod.startDate, 'yyyy-MM-dd')).toBe('2025-06-24');
      expect(format(result.currentPeriod.endDate, 'yyyy-MM-dd')).toBe('2025-07-07');
    });

    test('should handle year boundaries', () => {
      const testDate = new Date('2025-12-30T10:00:00');
      const result = calculator.getCurrentPeriodInfo(testDate);
      
      // Should be in a period that spans the year
      expect(result.currentPeriod.startDate.getFullYear()).toBe(2025);
      expect(result.nextPeriod.startDate.getFullYear()).toBe(2026);
    });

    test('should calculate payment dates correctly', () => {
      const testDate = new Date('2025-06-23T10:00:00');
      const result = calculator.getCurrentPeriodInfo(testDate);
      
      // Payment should be 7 days after period end (following Monday)
      expect(format(result.currentPeriod.paymentDate, 'yyyy-MM-dd')).toBe('2025-06-30');
      expect(result.currentPeriod.paymentDate.getDay()).toBe(1); // Monday
    });
  });

  describe('Last Day Detection', () => {
    test('should identify last day of period correctly', () => {
      expect(calculator.isLastDayOfPeriod(new Date('2025-06-23T10:00:00'))).toBe(true);
      expect(calculator.isLastDayOfPeriod(new Date('2025-06-22T10:00:00'))).toBe(false);
      expect(calculator.isLastDayOfPeriod(new Date('2025-06-24T10:00:00'))).toBe(false);
    });

    test('should handle last day at different times', () => {
      // Any time on the last day should return true
      expect(calculator.isLastDayOfPeriod(new Date('2025-06-23T00:01:00'))).toBe(true);
      expect(calculator.isLastDayOfPeriod(new Date('2025-06-23T23:59:00'))).toBe(true);
    });

    test('should work for future periods', () => {
      // Period 19 ends July 7, 2025
      expect(calculator.isLastDayOfPeriod(new Date('2025-07-07T10:00:00'))).toBe(true);
      // Period 20 ends July 21, 2025
      expect(calculator.isLastDayOfPeriod(new Date('2025-07-21T10:00:00'))).toBe(true);
    });
  });

  describe('Period Ordinals', () => {
    test('should generate correct ordinals', () => {
      const testCases = [
        { number: 1, expected: '1st' },
        { number: 2, expected: '2nd' },
        { number: 3, expected: '3rd' },
        { number: 4, expected: '4th' },
        { number: 11, expected: '11th' },
        { number: 12, expected: '12th' },
        { number: 13, expected: '13th' },
        { number: 21, expected: '21st' },
        { number: 22, expected: '22nd' },
        { number: 23, expected: '23rd' },
        { number: 101, expected: '101st' },
        { number: 111, expected: '111th' },
        { number: 112, expected: '112th' },
        { number: 113, expected: '113th' }
      ];

      testCases.forEach(({ number, expected }) => {
        const result = calculator.getOrdinal(number);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Message Formatting', () => {
    test('should generate correct bot-formatted message', () => {
      const testDate = new Date('2025-07-07T10:00:00'); // Last day of period 19
      const message = calculator.generateBotFormattedMessage('agentsmith', { 
        referenceDate: testDate 
      });

      expect(message.periodOrdinal).toBe('19th');
      expect(message.startDate).toBe('6/24');
      expect(message.endDate).toBe('7/7');
      expect(message.endDateLong).toContain('July 7');
      expect(message.paymentDate).toContain('July');
      expect(message.nextPeriodOrdinal).toBe('20th');
    });

    test('should include bot personality flavor', () => {
      const testDate = new Date('2025-07-07T10:00:00');
      
      // Test Agent Smith personality
      const agentMessage = calculator.generateBotFormattedMessage('agentsmith', { 
        referenceDate: testDate 
      });
      expect(agentMessage.greeting).toContain('Mr. Anderson');
      expect(agentMessage.signature).toContain('Agent Smith');

      // Test default personality
      const defaultMessage = calculator.generateBotFormattedMessage('default', { 
        referenceDate: testDate 
      });
      expect(defaultMessage.greeting).not.toContain('Mr. Anderson');
    });
  });

  describe('Edge Cases', () => {
    test('should handle dates before base period', () => {
      const testDate = new Date('2025-01-01T10:00:00');
      const result = calculator.getCurrentPeriodInfo(testDate);
      
      // Should calculate backwards from base period
      expect(result.currentPeriod.number).toBeLessThan(18);
      expect(result.currentPeriod.endDate).toBeLessThan(testDate);
    });

    test('should handle leap year dates', () => {
      const leapYearDate = new Date('2024-02-29T10:00:00');
      const result = calculator.getCurrentPeriodInfo(leapYearDate);
      
      // Should handle leap year date without errors
      expect(result.currentPeriod.number).toBeDefined();
      expect(result.currentPeriod.startDate).toBeDefined();
      expect(result.currentPeriod.endDate).toBeDefined();
    });

    test('should maintain Monday end dates', () => {
      // Check multiple periods to ensure all end on Monday
      const periods = [];
      let testDate = new Date('2025-06-23T10:00:00');
      
      for (let i = 0; i < 10; i++) {
        const result = calculator.getCurrentPeriodInfo(testDate);
        periods.push(result.currentPeriod);
        testDate = new Date(result.nextPeriod.startDate);
      }

      periods.forEach(period => {
        expect(period.endDate.getDay()).toBe(1); // All should end on Monday
      });
    });
  });

  describe('Period History', () => {
    test('should calculate future periods schedule', () => {
      const schedule = calculator.getNextPeriods(5, new Date('2025-06-23T10:00:00'));
      
      expect(schedule).toHaveLength(5);
      expect(schedule[0].number).toBe(19);
      expect(schedule[1].number).toBe(20);
      expect(schedule[2].number).toBe(21);
      expect(schedule[3].number).toBe(22);
      expect(schedule[4].number).toBe(23);
      
      // Verify continuous periods
      for (let i = 1; i < schedule.length; i++) {
        const prevEnd = schedule[i-1].endDate;
        const currentStart = schedule[i].startDate;
        const dayAfterPrevEnd = new Date(prevEnd);
        dayAfterPrevEnd.setDate(dayAfterPrevEnd.getDate() + 1);
        
        expect(format(currentStart, 'yyyy-MM-dd')).toBe(format(dayAfterPrevEnd, 'yyyy-MM-dd'));
      }
    });
  });
});

// Run tests if this file is executed directly
if (require.main === module) {
  console.log('Running PayPeriodCalculator tests...');
  console.log('Note: This file should be run with Jest: npm test');
}