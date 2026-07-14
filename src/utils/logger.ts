import pc from 'picocolors';

export interface Logger {
  info(message: string): void;
  success(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface WritableLike {
  write(chunk: string): unknown;
}

export function createLogger(out: WritableLike = process.stdout, err: WritableLike = process.stderr): Logger {
  return {
    info: (message: string) => {
      out.write(`${message}\n`);
    },
    success: (message: string) => {
      out.write(`${pc.green('[ok]')} ${message}\n`);
    },
    warn: (message: string) => {
      out.write(`${pc.yellow('[warn]')} ${message}\n`);
    },
    error: (message: string) => {
      err.write(`${pc.red('[fail]')} ${message}\n`);
    },
  };
}

/** Collects everything written to it, for use in tests. */
export class MemoryStream implements WritableLike {
  private chunks: string[] = [];

  write(chunk: string): boolean {
    this.chunks.push(chunk);
    return true;
  }

  toString(): string {
    return this.chunks.join('');
  }
}
