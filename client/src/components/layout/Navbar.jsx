import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';

const NavbarContainer = styled.nav`
  background-color: var(--dark);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 15px 0;
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    padding: 0 15px;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  color: var(--primary);
  font-family: var(--font-secondary);
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: var(--text-shadow);
  
  @media (max-width: 576px) {
    font-size: 1.3rem;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  
  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    flex-direction: column;
    background-color: var(--dark);
    padding: 20px;
    z-index: 100;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  }
`;

const NavLink = styled(Link)`
  color: var(--light);
  font-weight: 500;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--primary);
  }
  
  @media (max-width: 768px) {
    padding: 10px 0;
    width: 100%;
    text-align: center;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--light);
  font-size: 1.5rem;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 15px;
  background-color: rgba(56, 182, 255, 0.1);
  border: 1px solid rgba(56, 182, 255, 0.3);
  border-radius: 20px;
  color: var(--light);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(56, 182, 255, 0.2);
  }
`;

const ProfileAvatar = styled.div`
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: var(--light);
`;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <NavbarContainer>
      <NavContent>
        <Logo to="/dashboard">
          <span>PLANETFALL</span>
        </Logo>
        
        <MobileMenuButton onClick={toggleMenu}>
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </MobileMenuButton>
        
        <NavLinks isOpen={isOpen}>
          <NavLink to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</NavLink>
          <NavLink to="/profile" onClick={() => setIsOpen(false)}>Profile</NavLink>
          
          <ProfileButton onClick={handleLogout}>
            <ProfileAvatar>
              {user?.username?.charAt(0).toUpperCase()}
            </ProfileAvatar>
            <span>Logout</span>
          </ProfileButton>
        </NavLinks>
      </NavContent>
    </NavbarContainer>
  );
};

export default Navbar;