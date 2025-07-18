import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getShiftsForDateRange, createShift, bulkCreateShifts, deleteShiftsInRange } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      )
    }

    const shifts = await getShiftsForDateRange(
      new Date(startDate),
      new Date(endDate)
    )
    
    return NextResponse.json(shifts)
  } catch (error) {
    console.error('Error fetching shifts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shifts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Handle bulk creation
    if (Array.isArray(body)) {
      const result = await bulkCreateShifts(body.map(shift => ({
        ...shift,
        date: new Date(shift.date),
      })))
      return NextResponse.json(result, { status: 201 })
    }
    
    // Handle single creation
    const shift = await createShift({
      ...body,
      date: new Date(body.date),
    })
    
    return NextResponse.json(shift, { status: 201 })
  } catch (error) {
    console.error('Error creating shift(s):', error)
    return NextResponse.json(
      { error: 'Failed to create shift(s)' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      )
    }

    const result = await deleteShiftsInRange(
      new Date(startDate),
      new Date(endDate)
    )
    
    return NextResponse.json({ deleted: result.count })
  } catch (error) {
    console.error('Error deleting shifts:', error)
    return NextResponse.json(
      { error: 'Failed to delete shifts' },
      { status: 500 }
    )
  }
}