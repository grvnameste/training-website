// app/api/prisma/course/create/route.ts
import prisma from '../../../../../lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log('🔥 PRISMA CREATE API HIT')

    const course = await prisma.course.create({
      data: {
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        price: body.price,
        teacherId: body.teacherId,
        sections: {
          create: body.sections.map((s: any, i: number) => ({
            title: s.title,
            orderIndex: i,
            lessons: {
              create: s.lessons.map((l: any, j: number) => ({
                title: l.title,
                description: l.description,
                duration: l.duration,
                orderIndex: j,
              })),
            },
          })),
        },
      },
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error('CREATE COURSE ERROR:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
