import express from 'express'
import { login, refresh, logout } from '../services/auth'
import requestLimiter from '../middlewares/requestLimiter'

const loginLimiter = requestLimiter({
  max: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || '5', 10),
  message: 'Слишком много попыток входа, попробуйте позже'
})

const router = express.Router()

router.route('/')
  .post(loginLimiter, login)

router.route('/refresh')
  .get(refresh)

router.route('/logout')
  .post(logout)

export default router