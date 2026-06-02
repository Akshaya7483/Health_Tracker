import { Box, Flex, Button, Text } from '@chakra-ui/react'
import { LayoutDashboard, Activity, Droplets, Database } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export const BottomNavBar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      px={4}
      py={2}
      zIndex="1000"
      boxShadow="0 -2px 10px rgba(0,0,0,0.05)"
    >
      <Flex justify="space-around" align="center">
        <Button
          as={Link}
          to="/dashboard"
          variant="ghost"
          flexDirection="column"
          height="auto"
          py={2}
          color={isActive('/dashboard') ? 'blue.500' : 'gray.500'}
        >
          <LayoutDashboard size={24} />
          <Text fontSize="xs" mt={1}>Dashboard</Text>
        </Button>

        <Button
          as={Link}
          to="/water"
          variant="ghost"
          flexDirection="column"
          height="auto"
          py={2}
          color={isActive('/water') ? 'blue.500' : 'gray.500'}
        >
          <Droplets size={24} />
          <Text fontSize="xs" mt={1}>Water</Text>
        </Button>

        <Button
          as={Link}
          to="/tables"
          variant="ghost"
          flexDirection="column"
          height="auto"
          py={2}
          color={isActive('/tables') ? 'blue.500' : 'gray.500'}
        >
          <Database size={24} />
          <Text fontSize="xs" mt={1}>Tables</Text>
        </Button>

        <Button
          as={Link}
          to="/activity"
          variant="ghost"
          flexDirection="column"
          height="auto"
          py={2}
          color={isActive('/activity') ? 'blue.500' : 'gray.500'}
        >
          <Activity size={24} />
          <Text fontSize="xs" mt={1}>Activity</Text>
        </Button>
      </Flex>
    </Box>
  )
}
