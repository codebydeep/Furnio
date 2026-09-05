import { Router } from 'express'
import {
  register,
  login,
  me,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/authController.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { registerSchema, loginSchema, validate } from '../validators/authValidator.js'

const router = Router()

// ---------- Public ----------
router.post('/register', validate(registerSchema), register)
router.post('/login',    validate(loginSchema),    login)

// ---------- Authenticated ----------
router.get('/me', authenticate, me)

// ---------- Admin only — user management ----------
router.get('/users',      authenticate, authorize('ADMIN'), getAllUsers)
router.get('/users/:id',  authenticate, authorize('ADMIN'), getUserById)
router.patch('/users/:id',authenticate, authorize('ADMIN'), updateUser)
router.delete('/users/:id',authenticate, authorize('ADMIN'), deleteUser)

export default router
