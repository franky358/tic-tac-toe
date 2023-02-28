import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import Modal from 'react-modal'
import Game from '../pages/Game'
import io from 'socket.io-client'
import '../App.css'

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#000',
    borderRadius: '10px',
    padding: '3rem',
  },
}

Modal.setAppElement('#app')

const socket = io()

export default function Home() {
  const [modalIsOpen, setIsModalOpen] =
    useState(true)

  const history = useHistory()

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const [isConnected, setIsConnected] = useState(
    socket.connected
  )

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true)
    })

    return () => {
      socket.off('connect')
    }
  }, [])

  const isEmail = email =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(
      email
    )

  const handleStart = e => {
    e.preventDefault()
    if (!email) {
      setEmailError('Favor de ingresar un email')
      return false
    }
    if (!isEmail(email)) {
      setEmailError(
        'Favor de ingresar un email válido'
      )
      return false
    }

    socket.emit('LOGIN', { email }, response => {
      if (response === 'REJECTED') {
        setEmail(
          'Intenta con otro email de favor'
        )
      } else if (response === 'WELCOME') {
        socket.emit('WANNA_PLAY')
        history.push('/lobby')
      }
    })
  }

  return (
    <div className="container">
      <header>
        <Modal
          isOpen={modalIsOpen}
          // onAfterOpen={afterOpenModal}
          // onRequestClose={closeModal}
          style={modalStyles}
          contentLabel="Example Modal"
        >
          <h3 className="modalTitle">
            Ingresa tu correo
          </h3>
          <form onSubmit={handleStart}>
            <div className="email-container">
              <input
                name="email"
                type="email"
                onChange={e => {
                  setEmail(e.target.value)
                  setEmailError('')
                }}
                className="email-input"
              />
              <input
                type="submit"
                value="Entrar"
                className="send-button"
              />
              <span className="email-error">
                {emailError}
              </span>
            </div>
          </form>
        </Modal>
        <h1 className="title">
          Tic Tac Toe en React by Fr4nky Develop3r
          358
        </h1>
      </header>
      <Game />
    </div>
  )
}
