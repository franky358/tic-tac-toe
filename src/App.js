import React from 'react'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import './App.css'

export default function App() {
  return (
    <div className="container">
      <header>
        <h1 className="title">
          Tic Tac Toe en React by Fr4nky Develop3r
          358
        </h1>
      </header>
      <Game />
    </div>
  )
}
