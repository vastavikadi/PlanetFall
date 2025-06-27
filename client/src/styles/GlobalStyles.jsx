import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --primary: #38b6ff;
    --secondary: #ff5757;
    --tertiary: #57d982;
    --background: #121730;
    --surface: #1a2447;
    --dark: #0a0e1d;
    --light: #edf2f7;
    --card-bg: rgba(26, 36, 71, 0.8);
    --text-shadow: 0 0 10px rgba(56, 182, 255, 0.5);
    --box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    --glow: 0 0 15px rgba(56, 182, 255, 0.7);
    --font-primary: 'Poppins', sans-serif;
    --font-secondary: 'Play', sans-serif;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html, body {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    font-family: var(--font-primary);
    background-color: var(--background);
    color: var(--light);
    -webkit-tap-highlight-color: transparent;
    overscroll-behavior: none;
  }
  
  body {
    touch-action: manipulation;
  }
  
  #root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  button {
    cursor: pointer;
    font-family: var(--font-primary);
  }
  
  a {
    text-decoration: none;
    color: inherit;
  }
  
  /* Utility classes */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
  }
  
  .center-content {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  /* Animation keyframes */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  /* Loading screen */
  .loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--background);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    z-index: 9999;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(56, 182, 255, 0.3);
    border-radius: 50%;
    border-top-color: var(--primary);
    animation: spin 1s linear infinite;
  }
  
  /* Forms */
  .form-control {
    margin-bottom: 20px;
  }
  
  .form-label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  }
  
  .form-input {
    width: 100%;
    padding: 12px 15px;
    background-color: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: var(--light);
    font-size: 1rem;
    transition: all 0.3s ease;
  }
  
  .form-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(56, 182, 255, 0.3);
  }
  
  /* Buttons */
  .btn {
    display: inline-block;
    padding: 12px 24px;
    background-color: var(--primary);
    color: var(--light);
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--glow);
  }
  
  .btn:active {
    transform: translateY(0);
  }
  
  .btn-primary {
    background-color: var(--primary);
  }
  
  .btn-secondary {
    background-color: var(--secondary);
  }
  
  .btn-tertiary {
    background-color: var(--tertiary);
  }
  
  .btn-outline {
    background-color: transparent;
    border: 2px solid var(--primary);
  }
  
  .btn-outline:hover {
    background-color: rgba(56, 182, 255, 0.2);
  }
  
  .btn-lg {
    padding: 14px 28px;
    font-size: 1.1rem;
  }
  
  .btn-sm {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
  
  .btn-block {
    display: block;
    width: 100%;
  }
  
  .btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  /* Grid layouts */
  .grid {
    display: grid;
    gap: 20px;
  }
  
  .grid-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .grid-4 {
    grid-template-columns: repeat(4, 1fr);
  }
  
  /* Responsive grid adjustments */
  @media (max-width: 1024px) {
    .grid-4 {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  @media (max-width: 768px) {
    .grid-3, .grid-4 {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 576px) {
    .grid-2, .grid-3, .grid-4 {
      grid-template-columns: 1fr;
    }
  }
`;

export default GlobalStyles;