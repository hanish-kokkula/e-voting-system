import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { toast } from 'react-toastify'

// Components
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

// Pages
import Login from './pages/Login'
import Vote from './pages/Vote'
import AdminDashboard from './pages/admin/Dashboard'
import ManageCandidates from './pages/admin/ManageCandidates'
import ManageElections from './pages/admin/ManageElections'
import ViewBlockchain from './pages/admin/ViewBlockchain'
import ViewResults from './pages/admin/ViewResults'
import NotFound from './pages/NotFound'

// Context
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected voter routes */}
            <Route path="/vote" element={
              <ProtectedRoute>
                <Vote />
              </ProtectedRoute>
            } />
            
            {/* Protected admin routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/candidates" element={
              <AdminRoute>
                <ManageCandidates />
              </AdminRoute>
            } />
            <Route path="/admin/elections" element={
              <AdminRoute>
                <ManageElections />
              </AdminRoute>
            } />
            <Route path="/admin/blockchain" element={
              <AdminRoute>
                <ViewBlockchain />
              </AdminRoute>
            } />
            <Route path="/admin/results" element={
              <AdminRoute>
                <ViewResults />
              </AdminRoute>
            } />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
      </div>
    </AuthProvider>
  )
}

export default App