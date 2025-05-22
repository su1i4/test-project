import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Определяем интерфейс пользователя
interface User {
  id: string;
  email: string;
  password: string;
  registrationDate: string;
  subscriptions: string[];
}

// Константа для пути к файлу хранения пользователей (симуляция БД)
const USERS_FILE_PATH = path.join(process.cwd(), 'users.json');

// Функция для чтения данных пользователей
function readUsers(): User[] {
  try {
    if (!fs.existsSync(USERS_FILE_PATH)) {
      // Если файл не существует, создаем его с начальными данными
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

// Функция для сохранения данных пользователей
function saveUsers(users: User[]): void {
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Ошибка при сохранении данных пользователей:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Получаем данные запроса
    const body = await request.json();
    const { email, password } = body;

    // Проверяем наличие обязательных полей
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Отсутствуют обязательные поля' },
        { status: 400 }
      );
    }

    // Получаем существующих пользователей
    const users = readUsers();

    // Проверяем, существует ли пользователь с таким email
    if (users.some((user: User) => user.email === email)) {
      return NextResponse.json(
        { message: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Создаем нового пользователя
    const newUser: User = {
      id: (users.length + 1).toString(),
      email,
      password,
      registrationDate: new Date().toISOString(),
      subscriptions: []
    };

    // Добавляем пользователя в "базу данных"
    users.push(newUser);
    saveUsers(users);

    // Возвращаем успешный ответ
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