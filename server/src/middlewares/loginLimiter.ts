// import { Request, Response, NextFunction } from 'express'
import { rateLimit } from 'express-rate-limit'

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 login requests per `window` per minute
  message:
    { message: 'Слишком много попыток входа, попробуйте позже' },
  // handler: (req: Request, res: Response, next: NextFunction, options: any) => {
  //   res.status(options.statusCode).send(options.message)
  // },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

console.log(loginLimiter)

export default loginLimiter