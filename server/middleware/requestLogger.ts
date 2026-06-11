import morgan from 'morgan'

// Development: colored, detailed
export const devLogger = morgan('dev')

// Production: JSON structured logs (no sensitive data)
export const prodLogger = morgan((tokens, req: any, res) => {
  return JSON.stringify({
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    responseTime: tokens['response-time'](req, res) + 'ms',
    userId: req.user?._id || 'anonymous',
    // Never log: body, headers, tokens, keys
  })
})
