// import { Request, Response, NextFunction } from 'express'
import { rateLimit, Options } from 'express-rate-limit'

const requestLimiter = ({ max, message, windowMs }: Partial<Options>) => rateLimit({
  windowMs: windowMs || 60 * 1000, // 1 minute
  max: max || 5, // Limit each IP to 5 login requests per `window` per minute
  message:
    { message },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

export default requestLimiter