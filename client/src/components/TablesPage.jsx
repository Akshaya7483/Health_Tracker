import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Flex,
  Badge,
  Table,
} from '@chakra-ui/react'
import { Database, Table as TableIcon } from 'lucide-react'

export const TablesPage = () => {
  const [schema, setSchema] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:5000/api/db/schema')
      .then(res => res.json())
      .then(data => {
        setSchema(data.schema || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching schema:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Flex justify="center" align="center" h="60vh">
        <Spinner size="xl" />
      </Flex>
    )
  }

  return (
    <VStack spacing={8} align="stretch">
      <HStack>
        <Database size={28} color="#3182ce" />
        <Heading size="lg">Database Schema</Heading>
      </HStack>

      {schema.map((item) => (
        <Box 
          key={item.table} 
          p={5} 
          bg="white" 
          borderRadius="xl" 
          boxShadow="sm" 
          border="1px solid" 
          borderColor="gray.100"
        >
          <HStack mb={4}>
            <TableIcon size={20} color="#718096" />
            <Heading size="md" color="blue.600">{item.table}</Heading>
            <Badge colorScheme="blue" variant="subtle">{item.columns.length} Columns</Badge>
          </HStack>

          <Table.Root size="sm" variant="line">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Type</Table.ColumnHeader>
                <Table.ColumnHeader>Constraints</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {item.columns.map((col) => (
                <Table.Row key={col.name}>
                  <Table.Cell fontWeight="medium">{col.name}</Table.Cell>
                  <Table.Cell color="gray.600">{col.type}</Table.Cell>
                  <Table.Cell>
                    <HStack spacing={2}>
                      {col.pk === 1 && <Badge colorScheme="yellow" size="xs">PK</Badge>}
                      {col.notnull === 1 && <Badge colorScheme="red" size="xs">NOT NULL</Badge>}
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      ))}
    </VStack>
  )
}
