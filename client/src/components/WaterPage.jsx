import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  IconButton,
  createListCollection,
  Spinner
} from '@chakra-ui/react'
import { Settings, Plus, Droplets, History } from 'lucide-react'
import { Field } from './ui/field'
import { SelectRoot, SelectTrigger, SelectValueText, SelectContent, SelectItem } from './ui/select'
import { Checkbox } from './ui/checkbox'
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
  DialogCloseTrigger,
} from './ui/dialog'

const trackingModeCollection = createListCollection({
  items: [
    { label: 'Milliliters (ml)', value: 'ml' },
    { label: 'Liters (L)', value: 'liters' },
    { label: 'Glasses', value: 'glasses' },
    { label: 'Gulps', value: 'gulps' },
    { label: 'Drink Count', value: 'drink_count' },
  ],
})

export const WaterPage = ({ user }) => {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [meta, setMeta] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [loggingAmount, setLoggingAmount] = useState('')
  const [loggingNote, setLoggingNote] = useState('')

  const fetchWaterData = useCallback(async () => {
    if (!user) return
    try {
      const [metaRes, logsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/water/meta/${user.id}`),
        fetch(`http://localhost:5000/api/water/logs/${user.id}`)
      ])
      
      if (!metaRes.ok || !logsRes.ok) throw new Error('Failed to fetch data')

      const metaData = await metaRes.json()
      const logsData = await logsRes.json()
      setMeta(metaData)
      setLogs(logsData.logs || [])
    } catch (err) {
      console.error('Error fetching water data:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    let mounted = true
    if (mounted) {
      fetchWaterData()
    }
    return () => { mounted = false }
  }, [fetchWaterData])

  const handleLogWater = async (e) => {
    e.preventDefault()
    if (!loggingAmount || !meta) return

    try {
      const res = await fetch('http://localhost:5000/api/water/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          tracking_mode: meta.tracking_mode,
          quantity: parseFloat(loggingAmount),
          note: loggingNote
        })
      })
      if (res.ok) {
        setLoggingAmount('')
        setLoggingNote('')
        await fetchWaterData()
      }
    } catch (err) {
      console.error('Error logging water:', err)
    }
  }

  const handleUpdateSettings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/water/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...meta, user_id: user.id })
      })
      if (res.ok) {
        setIsSettingsOpen(false)
        await fetchWaterData()
      } else {
        const errorData = await res.json()
        alert(`Failed to save settings: ${errorData.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Error updating settings:', err)
      alert('Error connecting to server to save settings')
    }
  }

  if (loading && !meta) {
    return (
      <Flex justify="center" align="center" h="60vh">
        <Spinner size="xl" />
      </Flex>
    )
  }

  const totalIntake = logs.reduce((sum, log) => sum + log.quantity, 0)
  const progress = meta ? (totalIntake / meta.daily_goal) * 100 : 0

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center">
        <HStack>
          <Droplets color="#3182ce" size={28} />
          <Heading size="lg">Water Tracking</Heading>
        </HStack>
        <IconButton
          aria-label="Settings"
          variant="ghost"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings />
        </IconButton>
      </Flex>

      {/* Progress Card */}
      <Box p={6} bg="blue.50" borderRadius="xl" textAlign="center" border="1px solid" borderColor="blue.100">
        <Text fontSize="sm" color="blue.600" fontWeight="bold" mb={1}>DAILY GOAL</Text>
        <Heading size="2xl" color="blue.700">
          {totalIntake} / {meta?.daily_goal} <Text as="span" fontSize="lg">{meta?.tracking_mode}</Text>
        </Heading>
        <Box mt={4} h="12px" bg="blue.100" borderRadius="full" overflow="hidden">
          <Box h="100%" bg="blue.500" width={`${Math.min(progress, 100)}%`} transition="width 0.5s ease-out" />
        </Box>
        <Text mt={2} fontSize="sm" color="blue.600">
          {progress >= 100 ? "Goal reached! Stay hydrated! 💧" : `${Math.round(progress)}% of daily goal`}
        </Text>
      </Box>

      {/* Log Form */}
      <Box 
        p={5} 
        bg="white" 
        borderRadius="xl" 
        boxShadow="sm" 
        border="1px solid" 
        borderColor="gray.100"
      >
        <form onSubmit={handleLogWater}>
          <VStack spacing={5} align="stretch">
            <Field label={`Amount to Log (${meta?.tracking_mode})`} helperText={`How much did you drink just now?`}>
              <Input
                size="lg"
                type="number"
                placeholder="0.00"
                value={loggingAmount}
                onChange={(e) => setLoggingAmount(e.target.value)}
                required
                variant="subtle"
                bg="blue.50"
                _focus={{ bg: "white", borderColor: "blue.500" }}
              />
            </Field>
            <Field label="Note">
              <Input
                placeholder="Optional note..."
                value={loggingNote}
                onChange={(e) => setLoggingNote(e.target.value)}
                variant="subtle"
              />
            </Field>
            <Button 
              type="submit" 
              bg="blue.500" 
              color="white" 
              size="lg" 
              width="full" 
              _hover={{ bg: "blue.600" }}
              leftIcon={<Plus size={20} />}
            >
              Add Entry
            </Button>
          </VStack>
        </form>
      </Box>

      {/* Recent Logs */}
      <Box mt={2}>
        <Flex justify="space-between" align="center" mb={4}>
          <HStack>
            <History size={20} color="#718096" />
            <Heading size="sm" color="gray.600">TODAY'S HISTORY</Heading>
          </HStack>
          <Text fontSize="xs" color="gray.400" fontWeight="bold">{logs.length} ENTRIES</Text>
        </Flex>
        {logs.length === 0 ? (
          <Text color="gray.500" textAlign="center" py={4}>No water logged yet today.</Text>
        ) : (
          <VStack align="stretch" spacing={3}>
            {logs.map((log) => (
              <Flex
                key={log.water_log_id}
                p={3}
                bg="white"
                border="1px solid"
                borderColor="gray.100"
                borderRadius="lg"
                justify="space-between"
                align="center"
              >
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">{log.quantity} {log.tracking_mode}</Text>
                  {log.note && <Text fontSize="xs" color="gray.500">{log.note}</Text>}
                </VStack>
                <Text fontSize="xs" color="gray.400">
                  {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </Text>
              </Flex>
            ))}
          </VStack>
        )}
      </Box>

      {/* Settings Modal */}
      <DialogRoot open={isSettingsOpen} onOpenChange={(e) => setIsSettingsOpen(e.open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Water Settings</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack spacing={4} py={4}>
              <Field label="Tracking Mode">
                <SelectRoot
                  value={[meta?.tracking_mode]}
                  onValueChange={(e) => setMeta({ ...meta, tracking_mode: e.value[0] })}
                  collection={trackingModeCollection}
                >
                  <SelectTrigger>
                    <SelectValueText placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {trackingModeCollection.items.map((item) => (
                      <SelectItem item={item} key={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </Field>
              <Field label="Daily Goal">
                <Input
                  type="number"
                  value={meta?.daily_goal}
                  onChange={(e) => setMeta({ ...meta, daily_goal: parseFloat(e.target.value) })}
                />
              </Field>
              <Checkbox
                checked={meta?.reminders_enabled === 1}
                onCheckedChange={(e) => setMeta({ ...meta, reminders_enabled: e.checked ? 1 : 0 })}
              >
                Enable Reminders
              </Checkbox>
              {meta?.reminders_enabled === 1 && (
                <Field label="Reminder Interval (minutes)">
                  <Input
                    type="number"
                    value={meta?.reminder_interval_minutes}
                    onChange={(e) => setMeta({ ...meta, reminder_interval_minutes: parseInt(e.target.value) })}
                  />
                </Field>
              )}
            </VStack>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogActionTrigger>
            <Button onClick={handleUpdateSettings} colorScheme="blue">Save Changes</Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </VStack>
  )
}
