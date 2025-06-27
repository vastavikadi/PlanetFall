import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';

const LoginContainer = styled.div`
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

const LoginCard = styled.div`
  background-color: var(--surface);
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
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

const LoginTitle = styled.h2`
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
  z-index: 2;
`;

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      console.error("Login Error:", err);
      const errorMessage = err?.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      console.log("Error Message to be set:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <LoginContainer>
      <LoginCard>
        <Logo to="/">PLANETFALL</Logo>
        <LoginTitle>Welcome Back</LoginTitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
            />
          </div>
          
          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </Form>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register</Link></p>
        </div>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;