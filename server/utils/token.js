const { v4: uuidv4 } = require("uuid")
const resetPasswordToken = require("../models/resetPasswordToken")

const generateTokenRef = length => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let tokenRef = ""
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    tokenRef += characters.charAt(array[i] % characters.length)
  }
  return tokenRef
}

const generatePasswordResetToken = async email => {
  const token = uuidv4()
  const ref = generateTokenRef(7)

  const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000) // 24 hours

  const existingToken = await resetPasswordToken.findOne({ email })

  if (existingToken) {
    await resetPasswordToken.deleteOne({ _id: existingToken._id })
  }

  const passwordResetToken = resetPasswordToken.create({
    email,
    token,
    ref,
    expires,
  })

  return passwordResetToken
}

module.exports = {
  generatePasswordResetToken,
}