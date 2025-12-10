import styled, { css } from 'styled-components';

export const RoomsContainer = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 32px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.10);
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 32px;
  color: #2d3748;
`;

export const AddRoomForm = styled.form`
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
`;

export const Input = styled.input`
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
  &:focus {
    border-color: #3182ce;
  }
`;

export const Button = styled.button`
  padding: 10px 18px;
  background: #3182ce;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: 4px;
  transition: background 0.2s;
  &:hover {
    background: #2563eb;
  }
  ${props => props.$secondary && css`
    background: #e53e3e;
    &:hover { background: #c53030; }
  `}
`;

export const RoomCard = styled.div`
  background: #f7fafc;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  margin-bottom: 18px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2b6cb0;
`;

export const RoomDetails = styled.div`
  display: flex;
  justify-content: space-between;
  color: #4a5568;
`;

export const RoomActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
`;

export const ErrorMsg = styled.div`
  color: #e53e3e;
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 18px;
`;
