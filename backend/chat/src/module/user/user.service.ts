/*
curl -X POST http://user-service:5005/api/user-service/users/getUserByEmail \
     -H "Content-Type: application/json" \
     -d '{"email": "test@gmail.com"}'
*/
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
    console.error('Error fetching user by email:', err.message)
    return null
  }
}

export async function getUserById(id: number) {
  try {
    const res = await axiosMainInstance.post(`/getUserById`, { id })
    return res.data || null
  } catch (err: any) {
    console.error('Error fetching user by ID:', err.message)
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

export const isBlockedStatus = async (myEmail: string, hisEmail: string) => {
  const [fromBlockedList, toBlockedList] = await Promise.all([
    getIsBlocked(myEmail),
    getIsBlocked(hisEmail),
  ])

  const isBlockedByMe = fromBlockedList
    ? fromBlockedList.some((entry: any) => entry.blockedUser === hisEmail)
    : false

  const isBlockedByHim = toBlockedList
    ? toBlockedList.some((entry: any) => entry.blockedUser === myEmail)
    : false
  return { isBlockedByMe, isBlockedByHim }
}
