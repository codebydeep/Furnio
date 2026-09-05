import { Router } from 'express'
import {
  register,
  login,
  me,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  changeRole,
  deleteUser,
} from '../controllers/auth.controllers.js'
import { authenticate }  from '../middleware/auth.middleware.js'
import { authorize }     from '../middleware/authorize.middleware.js'
import {
  registerSchema,
  loginSchema,
  createUserSchema,
  updateUserSchema,
  changeRoleSchema,
  validate,
} from '../validators/auth.validator.js'

const router = Router()

/* ── Public ──────────────────────────────────────────────── */
router.post('/register', validate(registerSchema), register)
router.post('/login',    validate(loginSchema),    login)

/* ── Authenticated: current user ─────────────────────────── */
router.get('/me', authenticate, me)

/* ── Admin-only: user management ─────────────────────────── */
router.get   ('/users',          authenticate, authorize('ADMIN'), getAllUsers)
router.post  ('/users',          authenticate, authorize('ADMIN'), validate(createUserSchema), createUser)
router.get   ('/users/:id',      authenticate, authorize('ADMIN'), getUserById)
router.patch ('/users/:id',      authenticate, authorize('ADMIN'), validate(updateUserSchema), updateUser)
router.patch ('/users/:id/role', authenticate, authorize('ADMIN'), validate(changeRoleSchema), changeRole)
router.delete('/users/:id',      authenticate, authorize('ADMIN'), deleteUser)

export default router
