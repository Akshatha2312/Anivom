import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState({
    loading: true,
    data: null,
    error: null,
  })

  useEffect(() => {
    fetch('http://localhost:5000/api/v1/health')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        setBackendStatus({ loading: false, data: data, error: null })
      })
      .catch((err) => {
        setBackendStatus({ loading: false, data: null, error: err.message })
      })
  }, [])

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>ANIVOM Customer Application</h1>
      <p>Phase 1 — Customer Frontend to Backend Communication</p>

      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
        <h3>Backend Connection Status</h3>
        {backendStatus.loading && <p>Connecting to backend...</p>}
        {backendStatus.error && <p style={{ color: '#e53e3e' }}>Error: {backendStatus.error}</p>}
        {backendStatus.data && (
          <div>
            <p style={{ color: '#38a169', fontWeight: 'bold' }}>Status: {backendStatus.data.status}</p>
            <p>Message: {backendStatus.data.message}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
