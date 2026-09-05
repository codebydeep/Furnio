import { Router } from 'express'
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js'

const router = Router()

// Auth
router.post('/register', registerUser)
router.post('/login',    loginUser)

// CRUD
router.get('/',      getAllUsers)
router.get('/:id',   getUserById)
router.patch('/:id', updateUser)
router.delete('/:id', deleteUser)

export default router
