import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

interface User {
  id: string;
  email: string;
  password: string;
  registrationDate: string;
  subscriptions: string[];
}

const USERS_FILE_PATH = path.join(process.cwd(), 'users.json');

function readUsers(): User[] {
  try {
    if (!fs.existsSync(USERS_FILE_PATH)) {
      const initialUsers: User[] = [
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
      fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(initialUsers, null, 2));
      return initialUsers;
    }

    const data = fs.readFileSync(USERS_FILE_PATH, 'utf8');
    return JSON.parse(data) as User[];
  } catch (error) {
    console.error('Ошибка при чтении данных пользователей:', error);
    return [];
  }
}

function saveUsers(users: User[]): void {
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Ошибка при сохранении данных пользователей:', error);
  }
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

    const users = readUsers();

    if (users.some((user: User) => user.email === email)) {
      return NextResponse.json(
        { message: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    const newUser: User = {
      id: (users.length + 1).toString(),
      email,
      password,
      registrationDate: new Date().toISOString(),
      subscriptions: []
    };

    users.push(newUser);
    saveUsers(users);

    return NextResponse.json(
      { message: 'Регистрация успешна' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 