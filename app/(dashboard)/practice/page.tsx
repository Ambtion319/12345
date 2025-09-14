import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">Practice Mode</h1>
            </div>
            <nav className="flex space-x-4">
              <Button variant="outline">Dashboard</Button>
              <Button variant="outline">Practice</Button>
              <Button variant="outline">Analytics</Button>
              <Button variant="outline">Admin</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Choose Your Practice Mode</h2>
          <p className="text-gray-600 mt-2">Select how you want to practice your medical exam questions</p>
        </div>

        {/* Practice Modes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-6 h-6 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Tutor Mode
              </CardTitle>
              <CardDescription>
                Learn at your own pace with immediate feedback and explanations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Immediate feedback after each question</li>
                <li>• Detailed explanations</li>
                <li>• No time pressure</li>
                <li>• Perfect for learning</li>
              </ul>
              <Button className="w-full mt-4">Start Tutor Mode</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-6 h-6 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Timed Mode
              </CardTitle>
              <CardDescription>
                Simulate real exam conditions with time constraints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Realistic time pressure</li>
                <li>• Exam-like conditions</li>
                <li>• Performance tracking</li>
                <li>• Build test-taking skills</li>
              </ul>
              <Button className="w-full mt-4">Start Timed Mode</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-6 h-6 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Review Mode
              </CardTitle>
              <CardDescription>
                Review your flagged questions and past mistakes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Review flagged questions</li>
                <li>• See correct answers</li>
                <li>• Study explanations</li>
                <li>• Focus on weak areas</li>
              </ul>
              <Button className="w-full mt-4">Start Review Mode</Button>
            </CardContent>
          </Card>
        </div>

        {/* Question Banks */}
        <Card>
          <CardHeader>
            <CardTitle>Available Question Banks</CardTitle>
            <CardDescription>Select a question bank to practice with</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors cursor-pointer">
                <h3 className="font-semibold text-gray-900">USMLE Step 1</h3>
                <p className="text-sm text-gray-600 mt-1">2,847 questions</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completed</span>
                  <span className="text-xs text-gray-500 ml-2">78% accuracy</span>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors cursor-pointer">
                <h3 className="font-semibold text-gray-900">PLAB Part 1</h3>
                <p className="text-sm text-gray-600 mt-1">1,523 questions</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">In Progress</span>
                  <span className="text-xs text-gray-500 ml-2">65% accuracy</span>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors cursor-pointer">
                <h3 className="font-semibold text-gray-900">Cardiology</h3>
                <p className="text-sm text-gray-600 mt-1">456 questions</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">New</span>
                  <span className="text-xs text-gray-500 ml-2">Not started</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
