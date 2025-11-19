import express from 'express'
import { login, refresh, logout } from '../services/auth'

const router = express.Router()

router.route('/')
  .post(login)

router.route('/refresh')
  .get(refresh)

router.route('/logout')
  .post(logout)

export default router