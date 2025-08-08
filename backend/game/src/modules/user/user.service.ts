import axios from 'axios'

export const axiosMainInstance = axios.create({
  baseURL: `http://user-service:5005/api/user-service/users`,
  withCredentials: true,
})

export async function getUserByEmail(email: string) {
  try {
    const res = await axiosMainInstance.post(`/getUserByEmail`, {
      email,
    })
    return res.data || null
  } catch (err: any) {
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
    return null
  }
}
