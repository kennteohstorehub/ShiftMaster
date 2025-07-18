import { PrismaClient, UserRole, LeaveType, Priority } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create super admin user
  const hashedPassword = await bcrypt.hash('ShiftMaster2024!', 10)
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'kenn.teoh@storehub.com' },
    update: {},
    create: {
      email: 'kenn.teoh@storehub.com',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
    },
  })

  console.log('Created super admin:', superAdmin.email)

  // Create roles
  const roles = [
    { name: 'LiveChat', color: 'bg-blue-500', staffNeeded: 3 },
    { name: 'Inbound', color: 'bg-green-500', staffNeeded: 4 },
    { name: 'Outbound', color: 'bg-purple-500', staffNeeded: 2 },
  ]

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    })
  }

  console.log('Created roles')

  // Create staff members
  const staffMembers = [
    {
      name: 'Alice Johnson',
      email: 'alice@company.com',
      department: 'Customer Service',
      skills: ['LiveChat', 'Inbound'],
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
    },
    {
      name: 'Bob Smith',
      email: 'bob@company.com',
      department: 'Sales',
      skills: ['Outbound', 'Inbound'],
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
      },
    },
    {
      name: 'Carol Davis',
      email: 'carol@company.com',
      department: 'Support',
      skills: ['LiveChat', 'Inbound', 'Outbound'],
      availability: {
        monday: true,
        tuesday: true,
        wednesday: false,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      },
    },
    {
      name: 'David Wilson',
      email: 'david@company.com',
      department: 'Customer Service',
      skills: ['LiveChat'],
      availability: {
        monday: false,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
      },
    },
    {
      name: 'Emma Brown',
      email: 'emma@company.com',
      department: 'Sales',
      skills: ['Outbound'],
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: false,
        friday: true,
        saturday: false,
        sunday: false,
      },
    },
  ]

  for (const staff of staffMembers) {
    await prisma.staff.upsert({
      where: { email: staff.email },
      update: {},
      create: staff,
    })
  }

  console.log('Created staff members')

  // Create sample tasks
  const tasks = [
    {
      title: 'Update shift schedule for next month',
      description: 'Review and finalize the shift schedule for the upcoming month',
      priority: Priority.HIGH,
    },
    {
      title: 'Training session preparation',
      description: 'Prepare materials for the new employee training session',
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    },
    {
      title: 'Review leave requests',
      description: 'Process pending leave requests for the team',
      priority: Priority.URGENT,
    },
  ]

  for (const task of tasks) {
    await prisma.task.create({
      data: task,
    })
  }

  console.log('Created sample tasks')

  // Create a sample leave request
  const alice = await prisma.staff.findUnique({ where: { email: 'alice@company.com' } })
  
  if (alice) {
    await prisma.leaveRequest.create({
      data: {
        staffId: alice.id,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 2.5 weeks from now
        type: LeaveType.VACATION,
        reason: 'Family vacation',
      },
    })
    console.log('Created sample leave request')
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })