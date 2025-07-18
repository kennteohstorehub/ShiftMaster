import { prisma } from './prisma'
import { 
  Staff, 
  Role, 
  Shift, 
  LeaveRequest, 
  Task,
  LeaveType,
  LeaveStatus,
  Priority,
  TaskStatus,
  Prisma
} from '@prisma/client'

// Staff operations
export async function getAllStaff() {
  return prisma.staff.findMany({
    include: {
      shifts: true,
      leaveRequests: true,
    },
    orderBy: { name: 'asc' },
  })
}

export async function getStaffById(id: string) {
  return prisma.staff.findUnique({
    where: { id },
    include: {
      shifts: {
        include: {
          role: true,
        },
      },
      leaveRequests: true,
    },
  })
}

export async function createStaff(data: {
  name: string
  email: string
  department?: string
  skills: string[]
  availability: any
  workingDays?: number
}) {
  return prisma.staff.create({
    data,
  })
}

export async function updateStaff(id: string, data: Partial<Staff>) {
  return prisma.staff.update({
    where: { id },
    data,
  })
}

export async function deleteStaff(id: string) {
  return prisma.staff.delete({
    where: { id },
  })
}

// Role operations
export async function getAllRoles() {
  return prisma.role.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function createRole(data: {
  name: string
  color: string
  staffNeeded: number
}) {
  return prisma.role.create({
    data,
  })
}

export async function updateRole(id: string, data: Partial<Role>) {
  return prisma.role.update({
    where: { id },
    data,
  })
}

export async function deleteRole(id: string) {
  return prisma.role.delete({
    where: { id },
  })
}

// Shift operations
export async function getShiftsForDateRange(startDate: Date, endDate: Date) {
  return prisma.shift.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      staff: true,
      role: true,
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  })
}

export async function createShift(data: {
  date: Date
  startTime: string
  endTime: string
  staffId: string
  roleId: string
}) {
  return prisma.shift.create({
    data,
    include: {
      staff: true,
      role: true,
    },
  })
}

export async function updateShift(id: string, data: {
  staffId?: string
  roleId?: string
  startTime?: string
  endTime?: string
}) {
  return prisma.shift.update({
    where: { id },
    data,
    include: {
      staff: true,
      role: true,
    },
  })
}

export async function deleteShift(id: string) {
  return prisma.shift.delete({
    where: { id },
  })
}

export async function bulkCreateShifts(shifts: Array<{
  date: Date
  startTime: string
  endTime: string
  staffId: string
  roleId: string
}>) {
  return prisma.shift.createMany({
    data: shifts,
    skipDuplicates: true,
  })
}

export async function deleteShiftsInRange(startDate: Date, endDate: Date) {
  return prisma.shift.deleteMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  })
}

// Leave Request operations
export async function getAllLeaveRequests() {
  return prisma.leaveRequest.findMany({
    include: {
      staff: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getPendingLeaveRequests() {
  return prisma.leaveRequest.findMany({
    where: { status: LeaveStatus.PENDING },
    include: {
      staff: true,
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createLeaveRequest(data: {
  staffId: string
  startDate: Date
  endDate: Date
  type: LeaveType
  reason?: string
}) {
  return prisma.leaveRequest.create({
    data,
    include: {
      staff: true,
    },
  })
}

export async function updateLeaveRequest(id: string, data: {
  status?: LeaveStatus
  approvedBy?: string
  approvedAt?: Date
  comments?: string
}) {
  return prisma.leaveRequest.update({
    where: { id },
    data,
    include: {
      staff: true,
    },
  })
}

export async function getLeaveRequestsForPeriod(startDate: Date, endDate: Date) {
  return prisma.leaveRequest.findMany({
    where: {
      OR: [
        {
          startDate: {
            lte: endDate,
          },
          endDate: {
            gte: startDate,
          },
        },
      ],
      status: { in: [LeaveStatus.APPROVED, LeaveStatus.PENDING] },
    },
    include: {
      staff: true,
    },
  })
}

// Task operations
export async function getAllTasks() {
  return prisma.task.findMany({
    orderBy: [
      { status: 'asc' },
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
  })
}

export async function createTask(data: {
  title: string
  description?: string
  dueDate?: Date
  priority?: Priority
  assignedTo?: string
}) {
  return prisma.task.create({
    data: {
      ...data,
      priority: data.priority || Priority.MEDIUM,
    },
  })
}

export async function updateTask(id: string, data: Partial<Task>) {
  return prisma.task.update({
    where: { id },
    data,
  })
}

export async function deleteTask(id: string) {
  return prisma.task.delete({
    where: { id },
  })
}

// User operations
export async function createUser(data: {
  email: string
  password: string
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'USER'
}) {
  return prisma.user.create({
    data,
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}