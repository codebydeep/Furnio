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
} from '../controllers/authController.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { CAN_MANAGE_USERS } from '../config/roles.js'
import { registerSchema, loginSchema, changeRoleSchema, validate } from '../validators/authValidator.js'

const router = Router()

router.post('/register', validate(registerSchema), register)
router.post('/login',    validate(loginSchema),    login)

router.get('/me', authenticate, me)

router.get   ('/users',          authenticate, authorize(...CAN_MANAGE_USERS), getAllUsers)
router.get   ('/users/:id',      authenticate, authorize(...CAN_MANAGE_USERS), getUserById)
router.patch ('/users/:id',      authenticate, authorize(...CAN_MANAGE_USERS), updateUser)
router.patch ('/users/:id/role', authenticate, authorize(...CAN_MANAGE_USERS), validate(changeRoleSchema), changeRole)
router.delete('/users/:id',      authenticate, authorize(...CAN_MANAGE_USERS), deleteUser)

export default router
