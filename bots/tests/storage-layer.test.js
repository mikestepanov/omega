const FileStorage = require('../shared/storage/file-storage');
const GitStorage = require('../shared/storage/git-storage');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    access: jest.fn(),
    unlink: jest.fn(),
    readdir: jest.fn()
  }
}));

jest.mock('child_process');

describe('Storage Layer Security & Edge Cases', () => {
  describe('FileStorage', () => {
    let storage;
    const testDir = '/tmp/test-storage';
    
    beforeEach(() => {
      storage = new FileStorage(testDir);
      jest.clearAllMocks();
    });

    describe('Path Traversal Prevention', () => {
      test('should prevent directory traversal attacks', async () => {
        const maliciousPaths = [
          '../../../etc/passwd',
          '..\\..\\..\\windows\\system32',
          'valid/../../../etc/passwd',
          'data/../../sensitive.txt',
          './././../../../etc/passwd',
          'data%2F..%2F..%2Fetc%2Fpasswd'
        ];

        for (const path of maliciousPaths) {
          await expect(storage.read(path))
            .rejects.toThrow(/Invalid path/);
          await expect(storage.write(path, 'content'))
            .rejects.toThrow(/Invalid path/);
        }
      });

      test('should sanitize file names', async () => {
        const dangerousNames = [
          'file\x00.txt',  // Null byte
          'file\n.txt',    // Newline
          'file\r.txt',    // Carriage return
          'CON.txt',       // Windows reserved
          'PRN.txt',       // Windows reserved
          '.git/config',   // Hidden sensitive
          '~/.ssh/id_rsa'  // Home directory expansion
        ];

        for (const name of dangerousNames) {
          await expect(storage.write(name, 'content'))
            .rejects.toThrow(/Invalid filename/);
        }
      });
    });

    describe('Concurrent Operations', () => {
      test('should handle concurrent writes safely', async () => {
        const filename = 'concurrent-test.json';
        const writers = Array(50).fill(null).map((_, i) => 
          storage.write(filename, JSON.stringify({ id: i, data: 'x'.repeat(1000) }))
        );

        fs.writeFile.mockImplementation((path, data) => {
          // Simulate slow write
          return new Promise(resolve => setTimeout(resolve, Math.random() * 10));
        });

        await Promise.all(writers);
        
        // Should use atomic writes (temp file + rename)
        const writeCalls = fs.writeFile.mock.calls;
        const tempFiles = writeCalls.filter(call => call[0].includes('.tmp'));
        expect(tempFiles.length).toBeGreaterThan(0);
      });

      test('should handle read-write race conditions', async () => {
        const filename = 'race-test.json';
        let writeCount = 0;
        let readCount = 0;

        fs.readFile.mockImplementation(() => {
          readCount++;
          return Promise.resolve(JSON.stringify({ count: readCount }));
        });

        fs.writeFile.mockImplementation(() => {
          writeCount++;
          return Promise.resolve();
        });

        // Concurrent reads and writes
        const operations = [];
        for (let i = 0; i < 100; i++) {
          if (i % 2 === 0) {
            operations.push(storage.read(filename));
          } else {
            operations.push(storage.write(filename, JSON.stringify({ i })));
          }
        }

        await Promise.all(operations);
        expect(writeCount).toBe(50);
        expect(readCount).toBe(50);
      });
    });

    describe('Disk Space Handling', () => {
      test('should handle disk full errors', async () => {
        fs.writeFile.mockRejectedValueOnce(new Error('ENOSPC: no space left on device'));

        await expect(storage.write('test.json', 'x'.repeat(1000000)))
          .rejects.toThrow('Insufficient disk space');
      });

      test('should check disk space before large writes', async () => {
        const largeData = 'x'.repeat(100 * 1024 * 1024); // 100MB
        
        fs.writeFile.mockRejectedValueOnce(new Error('File too large'));

        await expect(storage.write('large.json', largeData))
          .rejects.toThrow('File too large');
      });
    });

    describe('Data Integrity', () => {
      test('should verify data integrity after write', async () => {
        const testData = { important: 'data', timestamp: Date.now() };
        const filename = 'integrity-test.json';

        fs.writeFile.mockResolvedValueOnce();
        fs.readFile.mockResolvedValueOnce(JSON.stringify(testData));

        await storage.write(filename, JSON.stringify(testData));
        
        // Should verify write by reading back
        expect(fs.readFile).toHaveBeenCalledWith(
          expect.stringContaining(filename),
          'utf8'
        );
      });

      test('should handle corrupted JSON gracefully', async () => {
        const corruptedData = '{"incomplete": "json", "missing": ';
        
        fs.readFile.mockResolvedValueOnce(corruptedData);

        await expect(storage.read('corrupted.json'))
          .rejects.toThrow('Data corruption detected');
      });
    });

    describe('Permission Errors', () => {
      test('should handle permission denied errors', async () => {
        fs.readFile.mockRejectedValueOnce(new Error('EACCES: permission denied'));

        await expect(storage.read('protected.json'))
          .rejects.toThrow('Permission denied');
      });

      test('should handle read-only filesystem', async () => {
        fs.writeFile.mockRejectedValueOnce(new Error('EROFS: read-only file system'));

        await expect(storage.write('readonly.json', 'data'))
          .rejects.toThrow('Read-only filesystem');
      });
    });
  });

  describe('GitStorage', () => {
    let storage;
    const testRepo = '/tmp/test-git-repo';
    
    beforeEach(() => {
      storage = new GitStorage(testRepo);
      jest.clearAllMocks();
    });

    describe('Command Injection Prevention', () => {
      test('should prevent command injection in commit messages', async () => {
        const maliciousMessages = [
          '"; rm -rf /',
          '`rm -rf /`',
          '$(rm -rf /)',
          '\n\nrm -rf /',
          '| rm -rf /',
          '& rm -rf /',
          '; cat /etc/passwd'
        ];

        for (const message of maliciousMessages) {
          execAsync.mockResolvedValueOnce({ stdout: 'OK' });
          
          await storage.commit('test.json', 'data', message);
          
          const execCall = execAsync.mock.calls[0][0];
          // Should escape dangerous characters
          expect(execCall).not.toContain('rm -rf');
          expect(execCall).not.toContain('cat /etc/passwd');
        }
      });

      test('should sanitize branch names', async () => {
        const dangerousBranches = [
          'main; rm -rf /',
          '../../../etc/passwd',
          'branch`whoami`',
          'branch$(id)',
          '-oneline',  // Git parameter injection
          '--help'      // Git parameter injection
        ];

        for (const branch of dangerousBranches) {
          await expect(storage.checkout(branch))
            .rejects.toThrow(/Invalid branch name/);
        }
      });
    });

    describe('Git Operations', () => {
      test('should handle merge conflicts', async () => {
        execAsync.mockRejectedValueOnce(new Error('CONFLICT (content): Merge conflict'));

        await expect(storage.pull())
          .rejects.toThrow('Merge conflict detected');
      });

      test('should handle detached HEAD state', async () => {
        execAsync.mockResolvedValueOnce({ stdout: 'HEAD detached' });

        await expect(storage.commit('test.json', 'data'))
          .rejects.toThrow('Repository in detached HEAD state');
      });

      test('should handle uncommitted changes', async () => {
        execAsync.mockResolvedValueOnce({ stdout: 'Changes not staged for commit' });

        await expect(storage.pull())
          .rejects.toThrow('Uncommitted changes present');
      });
    });

    describe('Repository Corruption', () => {
      test('should detect corrupted git objects', async () => {
        execAsync.mockRejectedValueOnce(new Error('fatal: loose object is corrupt'));

        await expect(storage.log(10))
          .rejects.toThrow('Repository corruption detected');
      });

      test('should handle missing .git directory', async () => {
        execAsync.mockRejectedValueOnce(new Error('fatal: not a git repository'));

        await expect(storage.status())
          .rejects.toThrow('Not a git repository');
      });
    });

    describe('Network Issues', () => {
      test('should handle network timeouts during push', async () => {
        execAsync.mockRejectedValueOnce(new Error('fatal: unable to access: Connection timed out'));

        await expect(storage.push())
          .rejects.toThrow('Network timeout');
      });

      test('should handle authentication failures', async () => {
        execAsync.mockRejectedValueOnce(new Error('fatal: Authentication failed'));

        await expect(storage.push())
          .rejects.toThrow('Git authentication failed');
      });
    });

    describe('Large File Handling', () => {
      test('should reject files exceeding size limit', async () => {
        const largeData = 'x'.repeat(100 * 1024 * 1024); // 100MB

        await expect(storage.commit('large.json', largeData))
          .rejects.toThrow('File too large for git');
      });

      test('should handle git buffer overflow', async () => {
        execAsync.mockRejectedValueOnce(new Error('fatal: Out of memory'));

        await expect(storage.diff())
          .rejects.toThrow('Git out of memory');
      });
    });
  });

  describe('Storage Factory', () => {
    test('should prevent instantiation of unauthorized storage types', () => {
      const StorageFactory = require('../shared/storage/factory');
      
      expect(() => StorageFactory.create('../../etc/passwd'))
        .toThrow('Invalid storage type');
      
      expect(() => StorageFactory.create('exec'))
        .toThrow('Invalid storage type');
    });
  });
});