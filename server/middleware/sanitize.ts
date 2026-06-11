import { Request, Response, NextFunction } from 'express'

// Strip dangerous characters from string inputs
const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return str
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') return sanitizeString(obj)
  if (Array.isArray(obj)) return obj.map(sanitizeObject)
  if (obj && typeof obj === 'object') {
    const sanitized: any = {}
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeObject(obj[key])
    }
    return sanitized
  }
  return obj
}

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) req.body = sanitizeObject(req.body)
  if (req.query) {
    const sanitized = sanitizeObject(req.query)
    for (const key of Object.keys(req.query)) {
      delete req.query[key]
    }
    Object.assign(req.query, sanitized)
  }
  next()
}
