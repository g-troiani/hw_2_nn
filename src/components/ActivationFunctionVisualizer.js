import React, { useState } from 'react';
import './ActivationFunctionVisualizer.css';

const ActivationFunctionVisualizer = () => {
  const [selectedFunction, setSelectedFunction] = useState('relu');
  const [inputValue, setInputValue] = useState(0);
  const [showDerivative, setShowDerivative] = useState(false);
  
  // Activation functions
  const activationFunctions = {
    relu: {
      name: 'ReLU (Rectified Linear Unit)',
      description: 'Most common in hidden layers. Solves vanishing gradient problem.',
      formula: 'f(x) = max(0, x)',
      derivative: "f'(x) = 1 if x > 0, else 0",
      func: (x) => Math.max(0, x),
      deriv: (x) => x > 0 ? 1 : 0,
      color: '#4CAF50',
      useCase: 'Hidden layers in deep networks'
    },
    sigmoid: {
      name: 'Sigmoid',
      description: 'Outputs between 0 and 1. Good for binary classification outputs.',
      formula: 'f(x) = 1 / (1 + e^(-x))',
      derivative: "f'(x) = f(x) * (1 - f(x))",
      func: (x) => 1 / (1 + Math.exp(-x)),
      deriv: (x) => {
        const sig = 1 / (1 + Math.exp(-x));
        return sig * (1 - sig);
      },
      color: '#2196F3',
      useCase: 'Binary classification output'
    },
    tanh: {
      name: 'Tanh (Hyperbolic Tangent)',
      description: 'Outputs between -1 and 1. Zero-centered, often better than sigmoid.',
      formula: 'f(x) = (e^x - e^(-x)) / (e^x + e^(-x))',
      derivative: "f'(x) = 1 - f(x)²",
      func: (x) => Math.tanh(x),
      deriv: (x) => 1 - Math.pow(Math.tanh(x), 2),
      color: '#FF9800',
      useCase: 'Hidden layers when zero-centered outputs desired'
    },
    leakyRelu: {
      name: 'Leaky ReLU',
      description: 'Like ReLU but allows small negative values. Prevents dead neurons.',
      formula: 'f(x) = max(0.01x, x)',
      derivative: "f'(x) = 1 if x > 0, else 0.01",
      func: (x) => x > 0 ? x : 0.01 * x,
      deriv: (x) => x > 0 ? 1 : 0.01,
      color: '#9C27B0',
      useCase: 'When ReLU causes dead neuron problems'
    }
  };
  
  const currentFunc = activationFunctions[selectedFunction];
  
  // Generate data points for plotting
  const generatePlotData = (func, range = [-5, 5], points = 200) => {
    const data = [];
    const step = (range[1] - range[0]) / points;
    
    for (let x = range[0]; x <= range[1]; x += step) {
      data.push({
        x: x,
        y: func(x)
      });
    }
    return data;
  };
  
  const plotData = generatePlotData(currentFunc.func);
  const derivData = generatePlotData(currentFunc.deriv);
  
  // SVG plot dimensions
  const plotWidth = 400;
  const plotHeight = 300;
  const margin = 40;
  
  // Convert data coordinates to SVG coordinates
  const xScale = (x) => ((x + 5) / 10) * (plotWidth - 2 * margin) + margin;
  const yScale = (y, isDerivative = false) => {
    const range = isDerivative ? 2 : (selectedFunction === 'tanh' ? 2 : 5);
    return plotHeight - margin - ((y + range/2) / range) * (plotHeight - 2 * margin);
  };
  
  // Environmental application examples
  const environmentalExamples = {
    relu: {
      scenario: "Pollution Threshold Detection",
      explanation: "ReLU is perfect for modeling environmental thresholds. When pollutant levels are below a safe threshold, the impact is zero. Above the threshold, impact increases linearly.",
      example: "If pollution < 50ppm → impact = 0\nIf pollution ≥ 50ppm → impact = pollution - 50"
    },
    sigmoid: {
      scenario: "Species Extinction Risk",
      explanation: "Sigmoid models probability of extinction. As environmental stress increases, extinction probability approaches 1 but never exceeds it.",
      example: "Risk = 1 / (1 + e^(-stress))\nStress incorporates temperature, habitat loss, etc."
    },
    tanh: {
      scenario: "Climate Deviation from Normal",
      explanation: "Tanh is ideal for measuring how much climate deviates from historical norms, giving values between -1 (much cooler/drier) and +1 (much warmer/wetter).",
      example: "Deviation = tanh((current - historical) / variance)\nOutputs: -1 to +1 range"
    },
    leakyRelu: {
      scenario: "Ecosystem Resilience",
      explanation: "Even small positive changes can have ecosystem benefits, while negative changes have proportionally larger impacts.",
      example: "If change > 0 → benefit = change\nIf change ≤ 0 → impact = 10 × change"
    }
  };
  
  return (
    <div className="activation-function-visualizer">
      <h3>⚡ Activation Functions in Neural Networks</h3>
      
      <div className="function-selector">
        <h4>Choose Activation Function:</h4>
        <div className="function-buttons">
          {Object.entries(activationFunctions).map(([key, func]) => (
            <button
              key={key}
              onClick={() => setSelectedFunction(key)}
              className={`function-button ${selectedFunction === key ? 'active' : ''}`}
              style={{ borderColor: func.color }}
            >
              {func.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="visualizer-content">
        <div className="function-plot">
          <div className="plot-controls">
            <label>
              <input
                type="checkbox"
                checked={showDerivative}
                onChange={(e) => setShowDerivative(e.target.checked)}
              />
              Show Derivative
            </label>
            
            <div className="input-tester">
              <label>
                Test Input: 
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.1"
                  value={inputValue}
                  onChange={(e) => setInputValue(parseFloat(e.target.value))}
                />
                <span>{inputValue.toFixed(1)}</span>
              </label>
              <div className="test-output">
                Output: <strong>{currentFunc.func(inputValue).toFixed(4)}</strong>
                {showDerivative && (
                  <span> | Derivative: <strong>{currentFunc.deriv(inputValue).toFixed(4)}</strong></span>
                )}
              </div>
            </div>
          </div>
          
          <svg width={plotWidth} height={plotHeight} className="function-svg">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#e0e0e0" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Axes */}
            <line 
              x1={margin} y1={plotHeight - margin} 
              x2={plotWidth - margin} y2={plotHeight - margin} 
              stroke="#333" strokeWidth="2"
            />
            <line 
              x1={xScale(0)} y1={margin} 
              x2={xScale(0)} y2={plotHeight - margin} 
              stroke="#333" strokeWidth="2"
            />
            
            {/* X-axis labels */}
            {[-4, -2, 0, 2, 4].map(x => (
              <g key={x}>
                <line 
                  x1={xScale(x)} y1={plotHeight - margin - 5} 
                  x2={xScale(x)} y2={plotHeight - margin + 5} 
                  stroke="#333" strokeWidth="1"
                />
                <text 
                  x={xScale(x)} y={plotHeight - margin + 20} 
                  textAnchor="middle" fontSize="12" fill="#333"
                >
                  {x}
                </text>
              </g>
            ))}
            
            {/* Y-axis labels */}
            {selectedFunction === 'tanh' ? 
              [-1, 0, 1].map(y => (
                <g key={y}>
                  <line 
                    x1={margin - 5} y1={yScale(y)} 
                    x2={margin + 5} y2={yScale(y)} 
                    stroke="#333" strokeWidth="1"
                  />
                  <text 
                    x={margin - 15} y={yScale(y) + 5} 
                    textAnchor="middle" fontSize="12" fill="#333"
                  >
                    {y}
                  </text>
                </g>
              )) :
              [0, 1, 2].map(y => (
                <g key={y}>
                  <line 
                    x1={margin - 5} y1={yScale(y)} 
                    x2={margin + 5} y2={yScale(y)} 
                    stroke="#333" strokeWidth="1"
                  />
                  <text 
                    x={margin - 15} y={yScale(y) + 5} 
                    textAnchor="middle" fontSize="12" fill="#333"
                  >
                    {y}
                  </text>
                </g>
              ))
            }
            
            {/* Function curve */}
            <polyline
              points={plotData.map(point => 
                `${xScale(point.x)},${yScale(point.y)}`
              ).join(' ')}
              fill="none"
              stroke={currentFunc.color}
              strokeWidth="3"
            />
            
            {/* Derivative curve */}
            {showDerivative && (
              <polyline
                points={derivData.map(point => 
                  `${xScale(point.x)},${yScale(point.y, true)}`
                ).join(' ')}
                fill="none"
                stroke={currentFunc.color}
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.7"
              />
            )}
            
            {/* Current input indicator */}
            <circle
              cx={xScale(inputValue)}
              cy={yScale(currentFunc.func(inputValue))}
              r="6"
              fill={currentFunc.color}
              stroke="#fff"
              strokeWidth="2"
            />
            
            {showDerivative && (
              <circle
                cx={xScale(inputValue)}
                cy={yScale(currentFunc.deriv(inputValue), true)}
                r="4"
                fill={currentFunc.color}
                stroke="#fff"
                strokeWidth="2"
                opacity="0.7"
              />
            )}
            
            {/* Labels */}
            <text x={plotWidth/2} y={plotHeight - 5} textAnchor="middle" fontSize="14" fontWeight="bold">
              Input (x)
            </text>
            <text x={15} y={plotHeight/2} textAnchor="middle" fontSize="14" fontWeight="bold" 
                  transform={`rotate(-90, 15, ${plotHeight/2})`}>
              Output f(x)
            </text>
            
            {/* Legend */}
            <g transform="translate(250, 50)">
              <rect x="0" y="0" width="140" height={showDerivative ? "60" : "40"} 
                    fill="rgba(255,255,255,0.9)" stroke="#333" rx="5"/>
              <line x1="10" y1="20" x2="30" y2="20" stroke={currentFunc.color} strokeWidth="3"/>
              <text x="35" y="25" fontSize="12">Function</text>
              {showDerivative && (
                <>
                  <line x1="10" y1="40" x2="30" y2="40" stroke={currentFunc.color} 
                        strokeWidth="2" strokeDasharray="5,5" opacity="0.7"/>
                  <text x="35" y="45" fontSize="12">Derivative</text>
                </>
              )}
            </g>
          </svg>
        </div>
        
        <div className="function-info">
          <div className="function-details">
            <h4>{currentFunc.name}</h4>
            <p>{currentFunc.description}</p>
            
            <div className="math-formulas">
              <div className="formula">
                <strong>Function:</strong> <code>{currentFunc.formula}</code>
              </div>
              <div className="formula">
                <strong>Derivative:</strong> <code>{currentFunc.derivative}</code>
              </div>
              <div className="use-case">
                <strong>Best Used For:</strong> {currentFunc.useCase}
              </div>
            </div>
          </div>
          
          <div className="environmental-example">
            <h5>🌍 Environmental Application</h5>
            <h6>{environmentalExamples[selectedFunction].scenario}</h6>
            <p>{environmentalExamples[selectedFunction].explanation}</p>
            <div className="example-code">
              <pre>{environmentalExamples[selectedFunction].example}</pre>
            </div>
          </div>
        </div>
      </div>
      
      <div className="key-concepts">
        <h4>🔑 Key Concepts</h4>
        <div className="concepts-grid">
          <div className="concept-card">
            <h5>Nonlinearity</h5>
            <p>Activation functions add nonlinearity to neural networks, allowing them to model complex environmental relationships that linear models cannot capture.</p>
          </div>
          
          <div className="concept-card">
            <h5>Gradient Flow</h5>
            <p>The derivative determines how gradients flow during backpropagation. Functions with zero derivatives (like ReLU for negative inputs) can cause vanishing gradients.</p>
          </div>
          
          <div className="concept-card">
            <h5>Output Range</h5>
            <p>Different ranges suit different tasks: [0,1] for probabilities, [-1,1] for centered outputs, or [0,∞) for quantities that can't be negative.</p>
          </div>
          
          <div className="concept-card">
            <h5>Computational Efficiency</h5>
            <p>ReLU is computationally simple (just a max operation), while sigmoid and tanh require expensive exponential calculations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivationFunctionVisualizer; 