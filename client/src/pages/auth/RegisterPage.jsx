import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: var(--background);
  position: relative;
  
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

const RegisterCard = styled.div`
  background-color: var(--surface);
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  box-shadow: var(--box-shadow);
  position: relative;
  z-index: 1;
  
  @media (max-width: 576px) {
    padding: 30px 20px;
  }
`;

const Logo = styled(Link)`
  display: block;
  text-align: center;
  color: var(--primary);
  font-family: var(--font-secondary);
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 30px;
  text-shadow: var(--text-shadow);
`;

const RegisterTitle = styled.h2`
  font-size: 1.8rem;
  color: var(--light);
  margin-bottom: 20px;
  text-align: center;
`;

const Form = styled.form`
  margin-top: 20px;
`;

const ErrorMessage = styled.div`
  background-color: rgba(255, 87, 87, 0.2);
  border-left: 4px solid var(--secondary);
  color: var(--light);
  padding: 10px 15px;
  margin-bottom: 20px;
  border-radius: 4px;
`;

const InterestsSection = styled.div`
  margin-bottom: 20px;
`;

const InterestsTitle = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const InterestsTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 5px;
`;

const InterestTag = styled.div`
  padding: 8px 15px;
  background-color: ${(props) => props.selected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${(props) => props.selected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    interests: []
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleInterestToggle = (interest) => {
    if (formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter(i => i !== interest)
      });
    } else {
      setFormData({
        ...formData,
        interests: [...formData.interests, interest]
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.interests.length === 0) {
      setError('Please select at least one interest');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const interests = [
    'science', 
    'history', 
    'gaming', 
    'movies', 
    'sports', 
    'tech', 
    'music', 
    'geography'
  ];
  
  return (
    <RegisterContainer>
      <RegisterCard>
        <Logo to="/">PLANETFALL</Logo>
        <RegisterTitle>Create Your Account</RegisterTitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <div className="form-control">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              className="form-input"
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
            />
          </div>
          
          <div className="form-control">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              className="form-input"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-control">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              className="form-input"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password"
              minLength="6"
            />
          </div>
          
          <div className="form-control">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              className="form-input"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>
          
          <InterestsSection>
            <InterestsTitle>Select Your Interests (For Quiz Questions)</InterestsTitle>
            <InterestsTags>
              {interests.map(interest => (
                <InterestTag
                  key={interest}
                  selected={formData.interests.includes(interest)}
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest.charAt(0).toUpperCase() + interest.slice(1)}
                </InterestTag>
              ))}
            </InterestsTags>
          </InterestsSection>
          
          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </Form>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link></p>
        </div>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default RegisterPage;