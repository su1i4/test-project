import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode('test-secret-key');

const USERS = [
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

async function createToken(userId: string) {
  return await new jose.SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(JWT_SECRET);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Отсутствуют обязательные поля' },
        { status: 400 }
      );
    }

    const user = USERS.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { message: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    const token = await createToken(user.id);

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 