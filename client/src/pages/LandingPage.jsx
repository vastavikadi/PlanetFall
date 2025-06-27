import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const LandingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: radial-gradient(circle at 50% 30%, rgba(56, 182, 255, 0.15) 0%, transparent 70%);
    z-index: 0;
  }
`;

const Header = styled.header`
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
`;

const Logo = styled.div`
  color: var(--primary);
  font-family: var(--font-secondary);
  font-size: 1.8rem;
  font-weight: 700;
  text-shadow: var(--text-shadow);
`;

const NavButtons = styled.div`
  display: flex;
  gap: 15px;
`;

const Hero = styled.section`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const HeroContent = styled.div`
  max-width: 600px;
  margin-right: 40px;
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 40px;
  }
`;

const HeroTitle = styled.h1`
  font-family: var(--font-secondary);
  font-size: 3rem;
  margin-bottom: 20px;
  color: var(--primary);
  text-shadow: var(--text-shadow);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 576px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: var(--light);
  line-height: 1.6;
  
  @media (max-width: 576px) {
    font-size: 1rem;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 15px;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const PlanetImage = styled.div`
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #5b8cff, #1c4db5);
  position: relative;
  box-shadow: 0 0 40px rgba(91, 140, 255, 0.5);
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.1) 50%, transparent 55%);
  }
  
  @media (max-width: 576px) {
    width: 200px;
    height: 200px;
  }
`;

const Features = styled.section`
  padding: 60px 20px;
  background-color: var(--dark);
  position: relative;
  z-index: 2;
`;

const FeaturesTitle = styled.h2`
  font-family: var(--font-secondary);
  text-align: center;
  font-size: 2rem;
  margin-bottom: 40px;
  color: var(--primary);
  text-shadow: var(--text-shadow);
`;

const FeatureCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background-color: var(--surface);
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: var(--light);
`;

const FeatureDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
`;

const LandingPage = () => {
  const navigate = useNavigate();
  
  return (
    <LandingContainer>
      <Header>
        <Logo>PLANETFALL</Logo>
        <NavButtons>
          <button className="btn btn-outline" onClick={() => navigate('/login')}>Login</button>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>Register</button>
        </NavButtons>
      </Header>
      
      <Hero>
        <HeroContent>
          <HeroTitle>Save the Dying World</HeroTitle>
          <HeroSubtitle>
            Join a multiplayer strategy-survival game where players collaborate to prevent their planet's destruction. But beware - an imposter may be secretly working against you!
          </HeroSubtitle>
          <HeroButtons>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>Play Now</button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/login')}>Learn More</button>
          </HeroButtons>
        </HeroContent>
        
        <PlanetImage />
      </Hero>
      
      <Features>
        <FeaturesTitle>Game Features</FeaturesTitle>
        <FeatureCards>
          <FeatureCard>
            <FeatureIcon>
              <i className="fas fa-brain"></i>
            </FeatureIcon>
            <FeatureTitle>Knowledge Quiz</FeatureTitle>
            <FeatureDescription>
              Answer trivia questions tailored to your interests to slow down planetary destruction. Every correct answer gives your planet more time!
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <i className="fas fa-ghost"></i>
            </FeatureIcon>
            <FeatureTitle>Monster Duel</FeatureTitle>
            <FeatureDescription>
              Defeat monsters in real-time combat to heal your planet. Coordinate with your team to maximize your planet's recovery!
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <i className="fas fa-user-secret"></i>
            </FeatureIcon>
            <FeatureTitle>Imposter Mode</FeatureTitle>
            <FeatureDescription>
              One player secretly works against the team. Identify the imposter before your planet is destroyed, or successfully sabotage if you're the imposter!
            </FeatureDescription>
          </FeatureCard>
        </FeatureCards>
      </Features>
    </LandingContainer>
  );
};

export default LandingPage;