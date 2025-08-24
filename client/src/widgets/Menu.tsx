import React, { useState, useRef, ReactElement } from 'react'
import styled from 'styled-components'
import { useOnClickOutside } from '@/hooks'
import { ReactComponent as Gear } from './gear.svg'
import { ThemeSwitch } from '@/features/ThemeSwitch/ThemeSwitch'

const ModalContainer = styled.header``

const ModalButton = styled.button`
  background-color: inherit;
  border: none;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 1s ease;

  &:hover {
    transform: rotate(180deg);
  }

  &:active {
    transform: scale(0.95);
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: transparent;
`

const ModalContent = styled.div`
  position: absolute;
  top: 55px;
  right: 2rem;
  background: #f2f3f5;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  z-index: 1000;
  width: 250px;
  border: 1px solid #ccc;

  h3 {
    color: #555;
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  p {
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
    color: #555;
  }
`

const CloseButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #c82333;
  }
`

export function Menu(): ReactElement {
  const [isModalOpen, setModalOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Use the custom hook to close modal on outside click
  useOnClickOutside(modalRef, () => setModalOpen(false))

  const toggleModal = () => {
    setModalOpen(!isModalOpen)
  }

  return (
    <ModalContainer>
      <ModalButton onClick={toggleModal}>
        <Gear />
      </ModalButton>

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent ref={modalRef}>
            <h3>Настройки</h3>
            <ThemeSwitch />
            {/* <CloseButton onClick={toggleModal}>Закрыть</CloseButton> */}
          </ModalContent>
        </ModalOverlay>
      )}
    </ModalContainer>
  )
}
