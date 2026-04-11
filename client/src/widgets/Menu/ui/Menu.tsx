import { useState, useRef, type ReactElement } from 'react'
import styled from 'styled-components'
import { useOnClickOutside } from '@/shared/hooks'
import { ReactComponent as Gear } from './gear.svg'
import { ThemeSwitch } from '@/features/ThemeSwitch'
import { Auth } from '@/features/Auth'

export function Menu(): ReactElement {
  const [isModalOpen, setModalOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useOnClickOutside(modalRef, () => setModalOpen(false))

  const toggleModal = () => {
    setModalOpen(!isModalOpen)
  }

  return (
    <ModalContainer>
      <ModalButton onClick={toggleModal} aria-label='Настройки'>
        <Gear />
      </ModalButton>

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent ref={modalRef}>
            <h3>Настройки</h3>
            <ThemeSwitch />
            <Auth />
          </ModalContent>
        </ModalOverlay>
      )}
    </ModalContainer>
  )
}

const ModalContainer = styled.header``

const ModalButton = styled.button`
  background-color: transparent;
  border: none;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform var(--transition-normal);
  color: inherit;
  border-radius: var(--radius-md);

  &:hover {
    transform: rotate(90deg);
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
  top: 56px;
  right: 1.5rem;
  background: var(--dropdown-over-nav);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 1.5rem;
  z-index: 1000;
  width: 260px;
  border: 1px solid var(--input-border);

  h3 {
    color: var(--text-color);
    margin: 0 0 1rem;
    font-size: 1rem;
    font-weight: 600;
  }

  p {
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: var(--text-muted);
  }

  > div {
    margin-top: 1rem;
  }
`
