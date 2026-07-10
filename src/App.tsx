import { Routes, Route } from 'react-router'
import { Suspense, lazy } from 'react'
import { Spinner } from '@/components/ui/spinner'

// Eagerly loaded pages
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

// Lazy loaded pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Lessons = lazy(() => import('./pages/Lessons'))
const LessonDetail = lazy(() => import('./pages/LessonDetail'))
const PlacementTest = lazy(() => import('./pages/PlacementTest'))
const VocabularyPage = lazy(() => import('./pages/VocabularyPage'))
const GrammarPage = lazy(() => import('./pages/GrammarPage'))
const WritingPage = lazy(() => import('./pages/WritingPage'))
const SpeakingPage = lazy(() => import('./pages/SpeakingPage'))
const ShadowingPage = lazy(() => import('./pages/ShadowingPage'))
const LearningPathsPage = lazy(() => import('./pages/LearningPathsPage'))
const MockExamsPage = lazy(() => import('./pages/MockExamsPage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="w-8 h-8 text-[var(--gold)]" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/lessons/:id" element={<LessonDetail />} />
        <Route path="/placement-test" element={<PlacementTest />} />
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/grammar" element={<GrammarPage />} />
        <Route path="/writing" element={<WritingPage />} />
        <Route path="/speaking" element={<SpeakingPage />} />
        <Route path="/shadowing" element={<ShadowingPage />} />
        <Route path="/learning-paths" element={<LearningPathsPage />} />
        <Route path="/mock-exams" element={<MockExamsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
