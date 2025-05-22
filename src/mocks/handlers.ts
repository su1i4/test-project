import { http, delay, HttpResponse } from 'msw'
import * as jose from 'jose'

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest extends LoginRequest {
  confirmPassword?: string
}

interface User {
  id: string
  email: string
  password: string
  registrationDate: string
  subscriptions: string[]
}

const USERS_STORAGE_KEY = 'msw-mock-users'

function readUsers(): User[] {
  try {
    if (typeof window === 'undefined') {
      return [
        {
          id: '1',
          email: 'test@example.com',
          password: 'password123',
          registrationDate: '2024-01-15T12:00:00Z',
          subscriptions: ['Basic Plan', 'Premium Content']
        }
      ]
    }
    
    const usersData = localStorage.getItem(USERS_STORAGE_KEY)
    
    if (!usersData) {
      const initialUsers = [
        {
          id: '1',
          email: 'sulaimanmind862@gmail.com',
          password: '123123',
          registrationDate: '2024-01-15T12:00:00Z',
          subscriptions: ['Basic Plan', 'Premium Content']
        }
      ]
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers))
      return initialUsers
    }
    
    return JSON.parse(usersData) as User[]
  } catch (error) {
    console.error('Ошибка при чтении данных пользователей:', error)
    return []
  }
}

function saveUsers(users: User[]): void {
  try {
    if (typeof window === 'undefined') {
      return
    }
    
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  } catch (error) {
    console.error('Ошибка при сохранении данных пользователей:', error)
  }
}

const JWT_SECRET = new TextEncoder().encode('test-secret-key')

async function createToken(userId: string) {
  return await new jose.SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(JWT_SECRET)
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

export const handlers = [
  http.post('/api/register', async ({ request }) => {
    await delay(1000)
    
    const body = await request.json() as RegisterRequest
    const { email, password } = body
    
    const users = readUsers()
    
    if (users.some(user => user.email === email)) {
      return HttpResponse.json(
        { message: 'Пользователь с таким email уже существует' },
        { status: 400 }
      )
    }
    
    const newUser = {
      id: (users.length + 1).toString(),
      email,
      password,
      registrationDate: new Date().toISOString(),
      subscriptions: []
    }
    
    users.push(newUser)
    saveUsers(users)
    
    return HttpResponse.json(
      { message: 'Регистрация успешна' },
      { status: 201 }
    )
  }),
  
  http.post('/api/login', async ({ request }) => {
    await delay(1000)
    
    const body = await request.json() as LoginRequest
    const { email, password } = body
    
    const users = readUsers()
    const user = users.find(u => u.email === email && u.password === password)
    
    if (!user) {
      return HttpResponse.json(
        { message: 'Неверный email или пароль' },
        { status: 401 }
      )
    }
    
    const token = await createToken(user.id)
    
    return HttpResponse.json({ token }, { status: 200 })
  }),
  
  http.get('/api/me', async ({ request }) => {
    await delay(800)
    
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Требуется авторизация' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    
    const payload = await verifyToken(token)
    
    if (!payload || !payload.sub) {
      return HttpResponse.json(
        { message: 'Недействительный токен' },
        { status: 401 }
      )
    }
    
    const users = readUsers()
    const user = users.find(u => u.id === payload.sub)
    
    if (!user) {
      return HttpResponse.json(
        { message: 'Пользователь не найден' },
        { status: 404 }
      )
    }
    
    const { password, ...userWithoutPassword } = user
    
    return HttpResponse.json(userWithoutPassword, { status: 200 })
  })
] 