import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: var(--dark);
  padding: 15px 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <div className="container">
        <p>© {new Date().getFullYear()} Planetfall: Defenders of the Dying World</p>
      </div>
    </FooterContainer>
  );
};

export default Footer;