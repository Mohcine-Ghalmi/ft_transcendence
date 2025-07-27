import axios from 'axios'

export const axiosMainInstance = axios.create({
  baseURL: `${process.env.MAIN_BACKEND_URL}/users`,
  withCredentials: true,
})

export async function getUserByEmail(email: string) {
  try {
    const res = await axiosMainInstance.post(`/getUserByEmail`, {
      email,
    })
    return res.data || null
  } catch (err: any) {
    console.error('Error fetching user by email:', err.message)
    return null
  }
}

export const getIsBlocked = async (myEmail: string) => {
  try {
    const res = await axiosMainInstance.post(`/getIsBlocked`, {
      myEmail,
    })
    return res.data || null
  } catch (err) {
    console.log(err)
    return null
  }
}
export async function getFriend(
  fromEmail: string,
  toEmail: string,
  status: string = 'ACCEPTED'
) {
  try {
    const res = await axiosMainInstance.post(`/getFriend`, {
      fromEmail,
      toEmail,
      status,
    })
    return res.data || null
  } catch (err: any) {
    console.error('Error fetching friend:', err.message)
    return null
  }
}
