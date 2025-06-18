import React from 'react';
import './PropagationSteps.css';

const PropagationSteps = ({ steps, isAnimating }) => {
  const getStepIcon = (type) => {
    switch (type) {
      case 'input':
        return '📥';
      case 'hidden':
        return '🧮';
      case 'output':
        return '📤';
      default:
        return '📊';
    }
  };

  const getStepTitle = (type) => {
    switch (type) {
      case 'input':
        return 'Input Normalization';
      case 'hidden':
        return 'Hidden Layer Processing';
      case 'output':
        return 'Output Calculation';
      default:
        return 'Processing Step';
    }
  };

  return (
    <div className="propagation-steps">
      <h3>🔄 Forward Propagation Steps</h3>
      
      {steps.length === 0 ? (
        <div className="no-steps">
          <div className="placeholder-message">
            <span className="placeholder-icon">🎯</span>
            <p>Run a simulation to see the forward propagation calculations step by step.</p>
            <p className="explanation">
              The neural network will process your environmental inputs through each layer, 
              showing the mathematical operations at each step.
            </p>
          </div>
        </div>
      ) : (
        <div className="steps-container">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step-card ${step.type} ${isAnimating ? 'animating' : ''}`}
              style={{ animationDelay: `${index * 0.3}s` }}
            >
              <div className="step-header">
                <span className="step-icon">{getStepIcon(step.type)}</span>
                <h4 className="step-title">
                  Step {index + 1}: {getStepTitle(step.type)}
                </h4>
              </div>
              
              <div className="step-content">
                <div className="step-description">
                  {step.description}
                </div>
                
                <div className="step-values">
                  <h5>Values:</h5>
                  <div className="values-display">
                    {step.values.map((value, valueIndex) => (
                      <span key={valueIndex} className="value-chip">
                        {value.toFixed(3)}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="step-calculation">
                  <h5>Calculation:</h5>
                  <pre className="calculation-text">
                    {step.calculation}
                  </pre>
                </div>
                
                {step.type === 'hidden' && (
                  <div className="activation-info">
                    <div className="info-badge">
                      <span className="badge-icon">ℹ️</span>
                      <span>ReLU Activation: max(0, x)</span>
                    </div>
                  </div>
                )}
                
                {step.type === 'output' && (
                  <div className="activation-info">
                    <div className="info-badge">
                      <span className="badge-icon">ℹ️</span>
                      <span>Sigmoid Activation: 1/(1+e^(-x))</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isAnimating && (
        <div className="calculation-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p>Calculating forward propagation...</p>
        </div>
      )}
      
      {steps.length > 0 && !isAnimating && (
        <div className="propagation-summary">
          <h4>📈 Summary</h4>
          <div className="summary-content">
            <p>
              <strong>Forward propagation completed!</strong> The neural network processed 
              the environmental inputs through {steps.length} calculation steps:
            </p>
            <ul>
              <li>✅ Input normalization and scaling</li>
              <li>✅ Hidden layer weighted sum and ReLU activation</li>
              <li>✅ Output layer calculation and sigmoid activation</li>
            </ul>
            <p>
              The final biodiversity impact score represents the network's prediction 
              based on the current environmental parameters.
            </p>
          </div>
        </div>
      )}
      
      <div className="math-explanation">
        <h4>🧮 Mathematical Operations</h4>
        <div className="explanation-content">
          <div className="operation-box">
            <h5>Weighted Sum</h5>
            <p>z = Σ(wᵢ × xᵢ) + b</p>
            <small>Sum of (weight × input) for each connection</small>
          </div>
          
          <div className="operation-box">
            <h5>ReLU Activation</h5>
            <p>f(z) = max(0, z)</p>
            <small>Returns z if positive, 0 if negative</small>
          </div>
          
          <div className="operation-box">
            <h5>Sigmoid Activation</h5>
            <p>σ(z) = 1/(1 + e^(-z))</p>
            <small>Maps any real number to (0,1)</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropagationSteps; 