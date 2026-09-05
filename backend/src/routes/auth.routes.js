import { Router } from 'express'
import {
  register,
  login,
  me,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeRole,
} from '../controllers/auth.controllers.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'
import { CAN_MANAGE_USERS } from '../config/roles.js'
import {
  registerSchema,
  loginSchema,
  updateUserSchema,
  changeRoleSchema,
  validate,
} from '../validators/auth.validator.js'

const router = Router()

// Public
router.post('/register', validate(registerSchema), register)
router.post('/login',    validate(loginSchema),    login)

// Current user
router.get('/me', authenticate, me)

// Admin-only user management
router.get   ('/users',          authenticate, authorize(...CAN_MANAGE_USERS), getAllUsers)
router.get   ('/users/:id',      authenticate, authorize(...CAN_MANAGE_USERS), getUserById)
router.patch ('/users/:id',      authenticate, authorize(...CAN_MANAGE_USERS), validate(updateUserSchema), updateUser)
router.patch ('/users/:id/role', authenticate, authorize(...CAN_MANAGE_USERS), validate(changeRoleSchema), changeRole)
router.delete('/users/:id',      authenticate, authorize(...CAN_MANAGE_USERS), deleteUser)

export default router
