import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.email || !body.username) {
      return NextResponse.json(
        { message: 'Email and first name are required' },
        { status: 400 }
      )
    }

    const backendRes = await axios.post(
      `${process.env.BACKEND_URL}/api/users/register/google`,
      body,
      {
        headers: {
          'x-api-key': process.env.NEXT_AUTH_KEY!,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    )
    console.log(backendRes)

    return NextResponse.json(backendRes.data, { status: 200 })
  } catch (err: any) {
    console.error('API route error:', err.response?.data || err.message)

    const status = err.response?.status || 500
    const message = err.response?.data?.message || 'Authentication failed'

    return NextResponse.json({ message }, { status })
  }
}
