import { NextResponse } from 'next/server'
import { setupDatabase } from '@/lib/db/setup'

export async function GET() {
  try {
    // First, test connection
    console.log('Testing database connection...')
    console.log('DB_HOST:', process.env.DB_HOST)
    console.log('DB_NAME:', process.env.DB_NAME)
    console.log('DB_USER:', process.env.DB_USER)
    console.log('DB_PASSWORD exists:', !!process.env.DB_PASSWORD)
    
    const success = await setupDatabase()
    
    if (success) {
      return NextResponse.json({
        message: 'Database tables created successfully!',
        status: 'success'
      })
    } else {
      return NextResponse.json({
        message: 'Database setup failed - check console for details',
        status: 'error'
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json({
      message: error.message || 'Unknown error',
      error: error.toString(),
      status: 'error'
    }, { status: 500 })
  }
}