import styled from "styled-components";
import { ThemeProps } from "../styles";

const Title = styled.h1<ThemeProps>`
  font-size: 1.5em;
  text-align: center;
  color: ${(props) => props.theme.main};
`;

function Main() {
  return <Title>React App</Title>;
}

export default Main;
