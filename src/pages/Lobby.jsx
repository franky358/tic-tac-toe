import { useState, useEffect } from 'react'
import ClipLoader from 'react-spinners/ClipLoader'

const override = {
  borderColor: '#00ff41',
  height: '100vh',
  width: '100nw',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const Lobby = () => {
  let [loading, setLoading] = useState(true)

  return (
    <div className="lobby-container">
      {loading && (
        <h3 className="lobby-title">
          Buscando oponente...
        </h3>
      )}
      <ClipLoader
        loading={loading}
        cssOverride={override}
        size={50}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  )
}

export default Lobby
