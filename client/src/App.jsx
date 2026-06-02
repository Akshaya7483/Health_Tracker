import { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  createListCollection
} from '@chakra-ui/react'

// UI Components from snippets
import { Checkbox } from './components/ui/checkbox'
import { Field } from './components/ui/field'
import { 
  SelectRoot, 
  SelectTrigger, 
  SelectValueText, 
  SelectContent, 
  SelectItem 
} from './components/ui/select'
import { BottomNavBar } from './components/BottomNavBar'
import { WaterPage } from './components/WaterPage'
import { TablesPage } from './components/TablesPage'

const genderCollection = createListCollection({
  items: [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ],
})

const MainContent = ({ user, handleLogout }) => {
  const location = useLocation();
  const getTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard';
      case '/water': return 'Water';
      case '/tables': return 'Tables';
      case '/activity': return 'Activity';
      default: return 'Daily Tracker';
    }
  };

  return (
    <Box minH="100vh" pb="80px">
      <Container maxW="container.md" py={10}>
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading size="lg">{getTitle()}</Heading>
            <Button onClick={handleLogout}>Logout</Button>
          </Flex>

          <Routes>
            <Route path="/dashboard" element={
              <VStack align="stretch" spacing={6}>
                <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                  <Text fontWeight="bold">Welcome, {user.full_name} (@{user.username})</Text>
                  <Text>Email: {user.email}</Text>
                </Box>
                <Box textAlign="center" py={10}>
                  <Text fontSize="xl">This is your dashboard. Keep up the good work!</Text>
                </Box>
              </VStack>
            } />
            <Route path="/water" element={<WaterPage user={user} />} />
            <Route path="/tables" element={<TablesPage />} />
            <Route path="/activity" element={
              <Box textAlign="center" py={10}>
                <Heading size="md" mb={4}>Activity Tracker</Heading>
                <Text fontSize="xl">This is the activity page. Track your progress here!</Text>
              </Box>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </VStack>
      </Container>
      <BottomNavBar />
    </Box>
  );
};

export default function App() {
  const [currentForm, setCurrentForm] = useState('login')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  // Check for saved session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  // Login Form State
  const [loginData, setLoginData] = useState({ identifier: '', password: '' })
  
  // Register Form State
  const [regData, setRegData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: '',
    weight_kg: '',
    height_cm: '',
    agree: false
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
      } else {
        alert(data.error || 'Login Failed')
      }
    } catch (err) {
      console.error(err)
      alert('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    if (regData.password !== regData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    if (!regData.agree) {
      alert('You must agree to the Terms of Service!')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      })
      const data = await res.json()
      if (res.ok) {
        alert('Registered successfully!')
        setCurrentForm('login')
      } else {
        alert(data.error || 'Registration Failed')
      }
    } catch (err) {
      console.error(err)
      alert('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return (
      <Router>
        <MainContent user={user} handleLogout={handleLogout} />
      </Router>
    )
  }

  return (
    <Container maxW="sm" py={20}>
      <VStack spacing={6} align="stretch">
        <HStack justify="center" spacing={4}>
          <Button variant={currentForm === 'login' ? 'solid' : 'ghost'} onClick={() => setCurrentForm('login')}>Login</Button>
          <Button variant={currentForm === 'register' ? 'solid' : 'ghost'} onClick={() => setCurrentForm('register')}>Register</Button>
        </HStack>

        {currentForm === 'login' ? (
          <form onSubmit={handleLogin}>
            <Stack spacing={4}>
              <Field label="Username or Email">
                <Input 
                  value={loginData.identifier} 
                  onChange={(e) => setLoginData({...loginData, identifier: e.target.value})}
                  required
                />
              </Field>
              <Field label="Password">
                <Input 
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                />
              </Field>
              <Button type="submit" loading={loading} width="full">Sign In</Button>
            </Stack>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <Stack spacing={4}>
              <Field label="Full Name">
                <Input 
                  value={regData.full_name}
                  onChange={(e) => setRegData({...regData, full_name: e.target.value})}
                  required
                />
              </Field>
              <Field label="Username">
                <Input 
                  value={regData.username}
                  onChange={(e) => setRegData({...regData, username: e.target.value})}
                  required
                />
              </Field>
              <Field label="Email">
                <Input 
                  type="email"
                  value={regData.email}
                  onChange={(e) => setRegData({...regData, email: e.target.value})}
                  required
                />
              </Field>
              <Field label="Password">
                <Input 
                  type="password"
                  value={regData.password}
                  onChange={(e) => setRegData({...regData, password: e.target.value})}
                  required
                />
              </Field>
              <Field label="Confirm Password">
                <Input 
                  type="password"
                  value={regData.confirmPassword}
                  onChange={(e) => setRegData({...regData, confirmPassword: e.target.value})}
                  required
                />
              </Field>
              <SimpleGrid columns={2} gap={4}>
                <Field label="DOB">
                  <Input type="date" value={regData.dob} onChange={(e) => setRegData({...regData, dob: e.target.value})} />
                </Field>
                <Field label="Gender">
                  <SelectRoot 
                    value={[regData.gender]} 
                    onValueChange={(e) => setRegData({...regData, gender: e.value[0]})}
                    collection={genderCollection}
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderCollection.items.map((item) => (
                        <SelectItem item={item} key={item.value}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </Field>
              </SimpleGrid>
              <SimpleGrid columns={2} gap={4}>
                <Field label="Weight (kg)">
                  <Input 
                    type="number" step="0.01" 
                    value={regData.weight_kg} 
                    onChange={(e) => setRegData({...regData, weight_kg: e.target.value})} 
                  />
                </Field>
                <Field label="Height (cm)">
                  <Input 
                    type="number" step="0.01" 
                    value={regData.height_cm} 
                    onChange={(e) => setRegData({...regData, height_cm: e.target.value})} 
                  />
                </Field>
              </SimpleGrid>
              <Checkbox 
                checked={regData.agree} 
                onCheckedChange={(e) => setRegData({...regData, agree: !!e.checked})}
              >
                I accept the Terms and Privacy Policy
              </Checkbox>
              <Button type="submit" loading={loading} width="full">Register</Button>
            </Stack>
          </form>
        )}
      </VStack>
    </Container>
  )
}
