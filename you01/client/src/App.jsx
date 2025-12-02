import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchTitle = async () => {
    if (!url) return
    setLoading(true)
    setError('')
    setTitle('')

    try {
      const response = await axios.post('http://localhost:5000/api/get-title', { url })
      setTitle(response.data.title)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch title')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>YouTube Title Fetcher</h1>
        <div className="input-group">
          <input
            type="text"
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button onClick={fetchTitle} disabled={loading}>
            {loading ? 'Loading...' : 'Get Title'}
          </button>
        </div>
        
        {title && (
          <div className="result success">
            <h3>Video Title:</h3>
            <p>{title}</p>
          </div>
        )}

        {error && (
          <div className="result error">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
