"use client"

import { withData } from "@/hocs"

interface User {
  id: string
  name: string
  email: string
}

function DataExample({ data }: { data: User[] }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User List</h1>
      <ul className="space-y-2">
        {data.map((user) => (
          <li key={user.id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
            <p className="font-bold">{user.name}</p>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Mock data fetching function
const fetchUsers = async (): Promise<User[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return [
    { id: "1", name: "John Doe", email: "john@example.com" },
    { id: "2", name: "Jane Smith", email: "jane@example.com" },
    { id: "3", name: "Bob Johnson", email: "bob@example.com" },
  ]
}

// Export the component wrapped with the data HOC
export default withData(DataExample, {
  fetchData: fetchUsers,
})
