import { Router } from 'express'
import {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js'
import { authenticate, authorize } from '../middleware/authenticate.js'

const router = Router()

/* ── Public auth ─────────────────────────────────────────────── */
router.post('/register', registerUser)   // POST /api/users/register
router.post('/login',    loginUser)      // POST /api/users/login

/* ── Authenticated routes ────────────────────────────────────── */
router.get('/me', authenticate, getMe)   // GET  /api/users/me

/* ── Admin-only CRUD ─────────────────────────────────────────── */
router.get(   '/',    authenticate, authorize('admin'), getAllUsers)
router.get(   '/:id', authenticate, authorize('admin'), getUserById)
router.patch( '/:id', authenticate, authorize('admin'), updateUser)
router.delete('/:id', authenticate, authorize('admin'), deleteUser)

export default router
