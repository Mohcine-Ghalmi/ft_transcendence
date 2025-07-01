import type { FastifyInstance } from 'fastify'
import {
  registerUserHandler,
  loginUserHandler,
  getLoggedInUser,
  logoutUserHandled,
  resetPassword,
  sendResetOtp,
  verifyOtp,
  googleRegister,
  getAllUsersData,
  getUser,
  listMyFriendsHandler,
  getRandomFriends,
  getMe,
  changePassword,
  hasTwoFA,
  updateUserData,
} from './user.controller'
import { $ref } from './user.schema'

async function userRoutes(server: FastifyInstance) {
  server.post(
    '/reset-password',
    { schema: { body: $ref('resetPasswordSchema') } },
    resetPassword
  )
  server.post(
    '/getRandomFriends',
    { preHandler: [server.authenticate] },
    getRandomFriends
  )
  server.post('/verify-otp', { schema: { body: $ref('OtpSchema') } }, verifyOtp)
  server.post('/verify-hasTwoFA', hasTwoFA)

  server.post(
    '/changePassword',
    { preHandler: server.authenticate },
    changePassword
  )

  server.post(
    '/password-reset-otp',
    { schema: { body: $ref('resetOtpSchema') } },
    sendResetOtp
  )

  server.post(
    '/register',
    {
      schema: {
        body: $ref('createUserSchema'),
      },
    },
    registerUserHandler
  )

  server.post(
    '/register/google',
    {
      // schema: {
      //   body: $ref('googleSchema'),
      // },
    },
    googleRegister
  )

  server.post(
    '/login',
    {
      schema: {
        body: $ref('loginSchema'),
        response: {
          200: $ref('loginResponseSchema'),
        },
      },
    },
    loginUserHandler
  )
  server.post(
    '/getUser',
    {
      preHandler: [server.authenticate],
    },
    getUser
  )

  server.get(
    '/getMe',
    {
      preHandler: [server.authenticate],
    },
    getMe
  )

  server.post(
    '/logout',
    { preHandler: [server.authenticate] },
    logoutUserHandled
  )

  server.post(
    '/updateUserData',
    { preHandler: [server.authenticate] },
    updateUserData
  )

  server.get(
    '/me',
    {
      preHandler: [server.authenticate],
      schema: { response: { 200: $ref('loginResponseSchema') } },
    },
    getLoggedInUser
  )
  server.get('/users', getAllUsersData)

  // List all friends with accepted status
  server.get('/friends', listMyFriendsHandler)
}

export default userRoutes
