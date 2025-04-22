"use client"

import { withAuth, withRole, withErrorBoundary, withData } from "@/hocs"
import { compose } from "@/lib/utils"

interface Report {
  id: string
  title: string
  data: string
}

function ReportsPageExample({ data }: { data: Report[] }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reports Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((report) => (
          <div key={report.id} className="p-4 border rounded-lg">
            <h2 className="font-bold">{report.title}</h2>
            <p>{report.data}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Mock data fetching function
const fetchReports = async (): Promise<Report[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return [
    { id: "1", title: "Monthly Sales", data: "Sales increased by 15%" },
    { id: "2", title: "User Growth", data: "New users up by 22%" },
    { id: "3", title: "Revenue", data: "Revenue up by 18%" },
  ]
}

// Compose multiple HOCs together
export default compose(
  withAuth,
  withRole<{ data: Report[] }>(["admin", "super_admin"]),
  withErrorBoundary,
  withData<Report[], {}>,
)(ReportsPageExample, {
  fetchData: fetchReports,
})
