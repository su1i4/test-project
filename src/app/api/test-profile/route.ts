import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const testProfile = {
    id: '1',
    email: 'test@example.com',
    registrationDate: '2024-01-15T12:00:00Z',
    subscriptions: ['Basic Plan', 'Premium Content']
  };
  
  return NextResponse.json(testProfile, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
} 