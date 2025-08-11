import styled from "styled-components";

const Foot = styled.footer`
  background-color: #333;
  color: #fff;
  padding: 1rem;
  text-align: center;
`;

const Copywrite = styled.div`
  margin: 0 auto;
`;

export function Footer() {
  return (
    <Foot>
      <Copywrite>©shevdi 2025</Copywrite>
    </Foot>
  );
}
