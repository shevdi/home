import styled from 'styled-components'
import { useSendLogoutMutation } from './store/authApiSlice'

const LogoutButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #c82333;
  }
`

export function Logout() {
  const [sendLogout] = useSendLogoutMutation()

  return <LogoutButton onClick={sendLogout}>Logout</LogoutButton>
}
