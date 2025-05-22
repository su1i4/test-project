import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

interface User {
  id: string;
  email: string;
  password: string;
  registrationDate: string;
  subscriptions: string[];
}

const JWT_SECRET = new TextEncoder().encode('test-secret-key');

const USERS: User[] = [
  {
    id: '1',
    email: 'test@example.com',
    password: 'password123',
    registrationDate: '2024-01-15T12:00:00Z',
    subscriptions: ['Basic Plan', 'Premium Content']
  },
  {
    id: '2',
    email: 'sulaimanmind862@gmail.com',
    password: '123123',
    registrationDate: '2024-01-15T12:00:00Z',
    subscriptions: ['Basic Plan', 'Premium Content']
  }
];

async function verifyToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    return null;
  }
}

function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Заголовок Authorization отсутствует' },
        { status: 401 }
      );
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Неверный формат заголовка Authorization, должен начинаться с "Bearer "' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    console.log('Токен получен, первые 10 символов:', token.substring(0, 10));
    
    const payload = await verifyToken(token);
    
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { message: 'Недействительный токен' },
        { status: 401 }
      );
    }
    
    const user = USERS.find(u => u.id === payload.sub);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    const { password, ...userWithoutPassword } = user;
    
    return addCorsHeaders(NextResponse.json(userWithoutPassword, { status: 200 }));
  } catch (error) {
    console.error('Ошибка при получении профиля:', error);
    return addCorsHeaders(NextResponse.json(
      { 
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    ));
  }
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