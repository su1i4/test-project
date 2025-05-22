import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import * as fs from 'fs';
import * as path from 'path';

// Определяем интерфейсы
interface User {
  id: string;
  email: string;
  password: string;
  registrationDate: string;
  subscriptions: string[];
}

// Секретный ключ для проверки JWT токенов
const JWT_SECRET = new TextEncoder().encode('test-secret-key');

// Константа для пути к файлу хранения пользователей
const USERS_FILE_PATH = path.join(process.cwd(), 'users.json');

// Функция для чтения данных пользователей
function readUsers(): User[] {
  try {
    if (!fs.existsSync(USERS_FILE_PATH)) {
      return [];
    }

    const data = fs.readFileSync(USERS_FILE_PATH, 'utf8');
    return JSON.parse(data) as User[];
  } catch (error) {
    console.error('Ошибка при чтении данных пользователей:', error);
    return [];
  }
}

// Функция для проверки JWT токена
async function verifyToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Получаем заголовок авторизации
    const authHeader = request.headers.get('Authorization');
    
    // Проверяем наличие заголовка авторизации
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Требуется авторизация' },
        { status: 401 }
      );
    }
    
    // Получаем токен из заголовка
    const token = authHeader.split(' ')[1];
    
    // Проверяем токен
    const payload = await verifyToken(token);
    
    // Проверяем валидность токена
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { message: 'Недействительный токен' },
        { status: 401 }
      );
    }
    
    // Ищем пользователя в "базе данных"
    const users = readUsers();
    const user = users.find(u => u.id === payload.sub);
    
    // Если пользователь не найден, возвращаем ошибку
    if (!user) {
      return NextResponse.json(
        { message: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    // Удаляем пароль из ответа
    const { password, ...userWithoutPassword } = user;
    
    // Возвращаем данные пользователя
    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('Ошибка при получении профиля:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 