import React, { useEffect, useState } from 'react'
import Grid from '../components/Grid'
import { useLocation } from 'react-router-dom'
import io from 'socket.io-client'

const clone = x => JSON.parse(JSON.stringify(x))

function generateGrid(rows, columns, mapper) {
  return Array(rows)
    .fill()
    .map(() => Array(columns).fill().map(mapper))
}

const newTicTacToeGrid = () =>
  generateGrid(3, 3, () => null)

function checkThree(a, b, c) {
  if (!a || !b || !c) return false
  return a === b && b === c
}

const flatten = arr =>
  arr.reduce((acc, cur) => [...acc, ...cur], [])

function checkForWin(flatGrid) {
  const [nw, n, ne, w, c, e, sw, s, se] = flatGrid

  return (
    checkThree(nw, n, ne) ||
    checkThree(w, c, e) ||
    checkThree(sw, s, se) ||
    checkThree(nw, w, sw) ||
    checkThree(n, c, s) ||
    checkThree(ne, e, se) ||
    checkThree(nw, c, se) ||
    checkThree(ne, c, sw)
  )
}

function checkForDraw(flatGrid) {
  return (
    !checkForWin(flatGrid) &&
    flatGrid.filter(Boolean).length ===
      flatGrid.length
  )
}

const NEXT_TURN = {
  O: 'X',
  X: 'O',
}

const getInitialState = symbolUser => ({
  grid: newTicTacToeGrid(),
  status: 'inProgress',
  turn: symbolUser,
})

const reducer = (state, action) => {
  if (
    state.status === 'success' &&
    action.type !== 'RESET'
  ) {
    return state
  }

  switch (action.type) {
    case 'RESET':
      return getInitialState()
    case 'CLICK': {
      const { x, y } = action.payload
      const { grid, turn } = state

      if (grid[y][x]) {
        return state
      }

      const nextState = clone(state)

      nextState.grid[y][x] = turn

      const flatGrid = flatten(nextState.grid)

      if (checkForWin(flatGrid)) {
        nextState.status = 'success'
        return nextState
      }

      if (checkForDraw(flatGrid)) {
        return getInitialState()
      }

      nextState.turn = NEXT_TURN[turn]

      return nextState
    }

    default:
      return state
  }
}

const socket = io(
  'https://server-tic-tac-toe.herokuapp.com'
)

const Game = () => {
  const location = useLocation()

  const [state, dispatch] = React.useReducer(
    reducer,
    getInitialState(
      location.state.gameData.you_play_with
    )
  )
  const { grid, status, turn } = state

  const [gameData, setGameData] = useState({})

  const [firstTirada, setFirstTirada] =
    useState(false)
  const [tiradaRival, setTiradaRival] =
    useState(false)

  const [message, setMesagge] = useState('')

  const handleClick = (x, y) => {
    if (
      gameData.you_play_with === 'X' &&
      !firstTirada
    ) {
      dispatch({
        type: 'CLICK',
        payload: { x, y },
      })
      socket.emit('TIRADA', { x, y })
      setFirstTirada(true)
      setTiradaRival(false)
      setMesagge(
        'Es turno de ' + gameData.rival.email
      )
      return
    }

    if (
      gameData.you_play_with === '0' &&
      !firstTirada &&
      tiradaRival
    ) {
      dispatch({
        type: 'CLICK',
        payload: { x, y },
      })
      socket.emit('TIRADA', { x, y })
      setFirstTirada(true)
      setTiradaRival(false)
      setMesagge(
        'Es turno de ' + gameData.rival.email
      )
      return
    }

    if (tiradaRival) {
      dispatch({
        type: 'CLICK',
        payload: { x, y },
      })
      socket.emit('TIRADA', { x, y })
      setTiradaRival(false)
      setMesagge(
        'Es turno de ' + gameData.rival.email
      )

      return
    }
  }

  const reset = () => {
    dispatch({ type: 'RESET' })
  }

  useEffect(() => {
    socket.emit(
      'UPDATE',
      location.state.gameData.you_are
    )
    socket.emit('GET_GAME_DATA', [], response => {
      if (response.answer === 'OK') {
        setGameData(response.game)
        if (response.game.you_play_with === 'X') {
          setMesagge('Tu turno')
        } else {
          setMesagge(
            'Es turno de ' +
              response.game.rival.email
          )
        }
      } else {
        console.log(
          'hubo un error trayendo la data'
        )
      }
    })
    socket.on('TIRADA_RIVAL', coordinates => {
      setFirstTirada(true)
      setTiradaRival(true)
      setMesagge('Tu turno')
      dispatch({
        type: 'CLICK',
        payload: {
          x: coordinates.x,
          y: coordinates.y,
        },
      })
    })
  }, [])

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        height: '90%',
        marginTop: '5rem',
      }}
    >
      <div>
        <p
          css={{
            color: '#fff',
          }}
        >
          {status === 'success' ? null : message}
        </p>
        <p
          css={{
            color: '#fff',
            marginLeft: '2rem',
          }}
        >
          {status === 'success'
            ? turn === gameData.you_play_with
              ? `Awesome! Ganaste`
              : `${gameData.rival.email} ganó`
            : null}
        </p>
      </div>
      <Grid
        grid={grid}
        handleClick={handleClick}
      />
    </div>
  )
}

export default Game
