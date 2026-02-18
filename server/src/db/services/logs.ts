import { Log } from '../models/log'

export type LogLevel = 'error' | 'warn' | 'info'

export interface LogEntry {
  level: LogLevel
  message: string
  error?: unknown
  context?: Record<string, unknown>
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return String(err)
}

function getErrorStack(err: unknown): string | undefined {
  if (err instanceof Error && err.stack) return err.stack
  return undefined
}

export async function writeLog(entry: LogEntry): Promise<void> {
  try {
    await Log.create({
      level: entry.level,
      message: entry.message,
      error: entry.error != null ? getErrorMessage(entry.error) : undefined,
      stack: entry.error != null ? getErrorStack(entry.error) : undefined,
      context: entry.context,
    })
  } catch (dbErr) {
    console.error('Failed to write log to DB:', dbErr)
  }
}

/**
 * Logs an error to the database. Fire-and-forget; never throws.
 * Use in catch blocks to persist errors for debugging.
 */
export function logError(
  err: unknown,
  context?: Record<string, unknown>
): void {
  const message = err instanceof Error ? err.message : String(err)
  writeLog({
    level: 'error',
    message,
    error: err,
    context,
  }).catch(() => {
    // Already logged in writeLog; avoid unhandled rejection
  })
}
