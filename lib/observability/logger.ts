type LogLevel = 'info' | 'warn' | 'error'

export type LogContext = Record<string, unknown>

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }
  return { message: String(error) }
}

function write(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...context,
  }
  const line = JSON.stringify(entry)
  if (level === 'error') {
    console.error(line)
  } else if (level === 'warn') {
    console.warn(line)
  } else {
    console.info(line)
  }
}

export const logger = {
  info(message: string, context?: LogContext) {
    write('info', message, context)
  },
  warn(message: string, context?: LogContext) {
    write('warn', message, context)
  },
  error(message: string, context?: LogContext) {
    write('error', message, context)
  },
  exception(message: string, error: unknown, context?: LogContext) {
    write('error', message, { ...context, error: serializeError(error) })
  },
}
