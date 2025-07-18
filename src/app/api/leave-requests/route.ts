import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getAllLeaveRequests, createLeaveRequest, getLeaveRequestsForPeriod } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let leaveRequests

    if (startDate && endDate) {
      leaveRequests = await getLeaveRequestsForPeriod(
        new Date(startDate),
        new Date(endDate)
      )
    } else {
      leaveRequests = await getAllLeaveRequests()
    }
    
    return NextResponse.json(leaveRequests)
  } catch (error) {
    console.error('Error fetching leave requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leave requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const leaveRequest = await createLeaveRequest({
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    })
    
    return NextResponse.json(leaveRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating leave request:', error)
    return NextResponse.json(
      { error: 'Failed to create leave request' },
      { status: 500 }
    )
  }
}