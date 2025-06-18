import React, { useState, useEffect } from 'react';
import './BackpropagationFlow.css';

const BackpropagationFlow = ({ inputData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flowData, setFlowData] = useState({});
  const [targetOutput, setTargetOutput] = useState(0.7);
  const [animationWeights, setAnimationWeights] = useState(null); // For showing weight changes during animation
  
  // Initial weights
  const initialWeights = {
    inputToHidden: [
      [0.5, -0.3, 0.4, 0.2],
      [0.3, 0.6, -0.2, 0.4],
      [-0.2, 0.4, 0.5, -0.3]
    ],
    hiddenToOutput: [[0.4], [0.3], [-0.5], [0.2]]
  };
  
  const [currentWeights, setCurrentWeights] = useState(initialWeights);
  const [learningRate] = useState(0.3); // Increased for more visible changes
  
  // Calculate forward and backward pass
  const calculateFlowData = (weights = currentWeights) => {
    // Normalize inputs
    const normalizedInputs = [
      Math.max(0.1, (inputData.temperatureChange + 2) / 6),
      Math.max(0.1, (inputData.precipitationChange + 30) / 60),
      Math.max(0.1, (inputData.co2Level - 350) / 450)
    ];
    
    // Forward pass
    const hiddenRaw = [];
    for (let j = 0; j < 4; j++) {
      const sum = normalizedInputs.reduce((acc, input, i) => 
        acc + input * weights.inputToHidden[i][j], 0);
      hiddenRaw.push(sum);
    }
    
    const hiddenActivated = hiddenRaw.map(val => Math.max(0, val));
    
    const outputRaw = hiddenActivated.reduce((acc, hidden, i) => 
      acc + hidden * weights.hiddenToOutput[i][0], 0);
    
    const output = 1 / (1 + Math.exp(-outputRaw));
    
    // Backward pass
    const outputError = output - targetOutput;
    const sigmoidDerivative = output * (1 - output);
    const outputDelta = outputError * sigmoidDerivative;
    
    const hiddenErrors = [];
    const hiddenDeltas = [];
    
    for (let j = 0; j < 4; j++) {
      const hiddenError = outputDelta * weights.hiddenToOutput[j][0];
      hiddenErrors.push(hiddenError);
      
      const reluDerivative = hiddenRaw[j] > 0 ? 1 : 0;
      hiddenDeltas.push(hiddenError * reluDerivative);
    }
    
    // Weight gradients
    const outputGradients = hiddenActivated.map(h => h * outputDelta);
    const hiddenGradients = normalizedInputs.map(input => 
      hiddenDeltas.map(delta => input * delta)
    );
    
    return {
      forward: {
        inputs: normalizedInputs,
        hiddenRaw,
        hiddenActivated,
        outputRaw,
        output
      },
      backward: {
        outputError,
        outputDelta,
        hiddenErrors,
        hiddenDeltas,
        outputGradients,
        hiddenGradients
      }
    };
  };
  
  // Calculate new weights based on gradients
  const calculateNewWeights = (weights, gradients) => {
    return {
      hiddenToOutput: weights.hiddenToOutput.map((w, i) => [
        w[0] - learningRate * gradients.outputGradients[i]
      ]),
      inputToHidden: weights.inputToHidden.map((weightsRow, i) =>
        weightsRow.map((w, j) => w - learningRate * gradients.hiddenGradients[i][j])
      )
    };
  };
  
  // Update weights with animation
  const updateWeights = () => {
    const freshData = calculateFlowData(currentWeights);
    const gradients = freshData.backward;
    
    if (!gradients || !gradients.outputGradients || !gradients.hiddenGradients) {
      console.warn('No gradients available for weight update');
      return;
    }
    
    const newWeights = calculateNewWeights(currentWeights, gradients);
    
    // Set animation weights to show the change
    setAnimationWeights({
      old: JSON.parse(JSON.stringify(currentWeights)),
      new: newWeights,
      gradients: gradients
    });
    
    // Actually update the weights
    setTimeout(() => {
      setCurrentWeights(newWeights);
      setFlowData(calculateFlowData(newWeights));
    }, 500);
  };
  
  useEffect(() => {
    setFlowData(calculateFlowData());
  }, [inputData, targetOutput]);
  
  useEffect(() => {
    if (!isAnimating) {
      setFlowData(calculateFlowData());
    }
  }, [currentWeights]);
  
  const steps = [
    {
      title: "1. Forward Pass Complete",
      description: "Network makes prediction",
      highlight: "forward"
    },
    {
      title: "2. Calculate Output Error",
      description: `Error = Prediction - Target`,
      highlight: "output-error"
    },
    {
      title: "3. Output Layer Delta",
      description: "Calculate gradient for output layer",
      highlight: "output-delta"
    },
    {
      title: "4. Propagate Error to Hidden Layer",
      description: "Error flows backward through weights",
      highlight: "hidden-error"
    },
    {
      title: "5. Hidden Layer Deltas",
      description: "Apply activation derivatives (ReLU)",
      highlight: "hidden-delta"
    },
    {
      title: "6. Calculate Weight Gradients",
      description: "Determine how to update each weight",
      highlight: "gradients"
    },
    {
      title: "7. Update Weights",
      description: "Weights ← Weights - α × Gradients",
      highlight: "update",
      action: updateWeights
    }
  ];
  
  const runAnimation = async () => {
    setIsAnimating(true);
    setCurrentStep(0);
    setAnimationWeights(null);
    
    // Recalculate flow data at start
    setFlowData(calculateFlowData());
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      if (steps[i].action) {
        await new Promise(resolve => setTimeout(resolve, 500));
        steps[i].action();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Extra time for weight update
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setIsAnimating(false);
    setAnimationWeights(null);
  };
  
  const resetAnimation = () => {
    setCurrentStep(0);
    setIsAnimating(false);
    setAnimationWeights(null);
    setCurrentWeights(initialWeights);
    setFlowData(calculateFlowData(initialWeights));
  };
  
  if (!flowData.forward || !flowData.backward) {
    return <div>Loading...</div>;
  }
  
  // Determine which weights to display
  const displayWeights = currentStep === 7 && animationWeights ? animationWeights.new : currentWeights;
  const showWeightChange = currentStep === 7 && animationWeights;
  
  return (
    <div className="backpropagation-flow">
      <h3>🔄 Backpropagation Flow Visualizer</h3>
      
      <div className="flow-controls">
        <div className="target-control">
          <label>
            Target Output: 
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={targetOutput}
              onChange={(e) => setTargetOutput(parseFloat(e.target.value))}
              disabled={isAnimating}
            />
            <span>{targetOutput.toFixed(1)}</span>
          </label>
        </div>
        
        <button 
          onClick={runAnimation} 
          disabled={isAnimating}
          className="animate-button"
        >
          {isAnimating ? '🔄 Animating...' : '▶️ Start Animation'}
        </button>
        
        <button 
          onClick={resetAnimation} 
          disabled={isAnimating}
          className="reset-button"
        >
          🔄 Reset
        </button>
        
        <div className="step-info">
          <span>Step {currentStep + 1} of {steps.length}</span>
        </div>
      </div>
      
      <div className="current-step-info">
        <h4>{steps[currentStep].title}</h4>
        <p>{steps[currentStep].description}</p>
        {currentStep === 2 && flowData.forward && (
          <p className="calculation-detail">
            {flowData.forward.output.toFixed(4)} - {targetOutput} = {flowData.backward.outputError.toFixed(4)}
          </p>
        )}
      </div>
      
      <div className="flow-diagram">
        <svg width="900" height="600" className="flow-svg">
          {/* Input nodes */}
          {[0, 1, 2].map(i => (
            <g key={`input-${i}`}>
              <circle
                cx={80}
                cy={120 + i * 100}
                r={25}
                fill={currentStep === 0 ? "#4CAF50" : "#e0e0e0"}
                stroke="#333"
                strokeWidth="2"
                className={currentStep === 0 ? "highlighted" : ""}
              />
              <text
                x={80}
                y={125 + i * 100}
                textAnchor="middle"
                fontSize="10"
                fill="#333"
                fontWeight="bold"
              >
                {flowData.forward.inputs[i].toFixed(2)}
              </text>
              <text
                x={80}
                y={90 + i * 100}
                textAnchor="middle"
                fontSize="11"
                fill="#333"
                fontWeight="bold"
              >
                I{i + 1}
              </text>
            </g>
          ))}
          
          {/* Hidden nodes */}
          {[0, 1, 2, 3].map(j => (
            <g key={`hidden-${j}`}>
              <circle
                cx={350}
                cy={100 + j * 80}
                r={25}
                fill={
                  currentStep >= 3 && currentStep <= 4 ? "#FF9800" : 
                  currentStep === 0 ? "#2196F3" : "#e0e0e0"
                }
                stroke="#333"
                strokeWidth="2"
                className={
                  (currentStep === 3 || currentStep === 4) ? "highlighted error-flow" : 
                  currentStep === 0 ? "highlighted" : ""
                }
              />
              <text
                x={350}
                y={105 + j * 80}
                textAnchor="middle"
                fontSize="10"
                fill="#333"
                fontWeight="bold"
              >
                {flowData.forward.hiddenActivated[j].toFixed(2)}
              </text>
              <text
                x={350}
                y={75 + j * 80}
                textAnchor="middle"
                fontSize="11"
                fill="#333"
                fontWeight="bold"
              >
                H{j + 1}
              </text>
              
              {/* Error values for hidden nodes */}
              {(currentStep === 4 || currentStep === 5) && (
                <text
                  x={400}
                  y={108 + j * 80}
                  fontSize="9"
                  fill="#F44336"
                  fontWeight="bold"
                >
                  δ={flowData.backward.hiddenDeltas[j].toFixed(3)}
                </text>
              )}
            </g>
          ))}
          
          {/* Output node */}
          <g>
            <circle
              cx={620}
              cy={220}
              r={30}
              fill={
                currentStep >= 1 && currentStep <= 2 ? "#F44336" : 
                currentStep === 0 ? "#9C27B0" : "#e0e0e0"
              }
              stroke="#333"
              strokeWidth="3"
              className={
                (currentStep === 1 || currentStep === 2) ? "highlighted error-output" : 
                currentStep === 0 ? "highlighted" : ""
              }
            />
            <text
              x={620}
              y={225}
              textAnchor="middle"
              fontSize="12"
              fill="#333"
              fontWeight="bold"
            >
              {flowData.forward.output.toFixed(3)}
            </text>
            <text
              x={620}
              y={185}
              textAnchor="middle"
              fontSize="12"
              fill="#333"
              fontWeight="bold"
            >
              Output
            </text>
            
            {/* Error display */}
            {currentStep >= 1 && (
              <text
                x={620}
                y={270}
                textAnchor="middle"
                fontSize="11"
                fill="#F44336"
                fontWeight="bold"
              >
                Error: {flowData.backward.outputError.toFixed(3)}
              </text>
            )}
          </g>
          
          {/* Target value */}
          <g>
            <rect
              x={720}
              y={200}
              width={80}
              height={40}
              fill="#4CAF50"
              stroke="#333"
              strokeWidth="2"
              rx="5"
              className={currentStep === 1 ? "highlighted" : ""}
            />
            <text
              x={760}
              y={215}
              textAnchor="middle"
              fontSize="10"
              fill="#333"
              fontWeight="bold"
            >
              Target
            </text>
            <text
              x={760}
              y={230}
              textAnchor="middle"
              fontSize="12"
              fill="#333"
              fontWeight="bold"
            >
              {targetOutput.toFixed(3)}
            </text>
          </g>
          
          {/* Forward connections */}
          {[0, 1, 2].map(i => 
            [0, 1, 2, 3].map(j => (
              <line
                key={`forward-${i}-${j}`}
                x1={105}
                y1={120 + i * 100}
                x2={325}
                y2={100 + j * 80}
                stroke={currentStep === 0 ? "#4CAF50" : "#ccc"}
                strokeWidth={currentStep === 0 ? "3" : "1"}
                opacity={currentStep === 0 ? "1" : "0.5"}
                className={currentStep === 0 ? "forward-flow" : ""}
              />
            ))
          )}
          
          {[0, 1, 2, 3].map(j => (
            <line
              key={`forward-hidden-${j}`}
              x1={375}
              y1={100 + j * 80}
              x2={590}
              y2={220}
              stroke={currentStep === 0 ? "#2196F3" : "#ccc"}
              strokeWidth={currentStep === 0 ? "3" : "1"}
              opacity={currentStep === 0 ? "1" : "0.5"}
              className={currentStep === 0 ? "forward-flow" : ""}
            />
          ))}
          
          {/* Backward error flow */}
          {currentStep >= 3 && [0, 1, 2, 3].map(j => (
            <line
              key={`backward-${j}`}
              x1={590}
              y1={220}
              x2={375}
              y2={100 + j * 80}
              stroke="#F44336"
              strokeWidth="3"
              opacity="0.8"
              strokeDasharray="5,5"
              className="backward-flow"
            />
          ))}
          
          {/* Weight displays - Hidden to Output */}
          {[0, 1, 2, 3].map(j => {
            const weight = displayWeights.hiddenToOutput[j][0];
            const oldWeight = showWeightChange ? animationWeights.old.hiddenToOutput[j][0] : weight;
            const gradient = currentStep === 6 ? flowData.backward.outputGradients[j] : null;
            
            return (
              <g key={`weight-ho-${j}`}>
                <text
                  x={500}
                  y={155 + j * 80}
                  fontSize="11"
                  fill={showWeightChange && weight !== oldWeight ? 
                    (weight < oldWeight ? "#F44336" : "#4CAF50") : "#333"}
                  fontWeight="bold"
                  textAnchor="middle"
                  className={showWeightChange ? "weight-updating" : ""}
                >
                  w={weight.toFixed(2)}
                </text>
                {showWeightChange && (
                  <text
                    x={500}
                    y={170 + j * 80}
                    fontSize="9"
                    fill={weight < oldWeight ? "#F44336" : "#4CAF50"}
                    textAnchor="middle"
                  >
                    {weight < oldWeight ? '↓' : '↑'} {Math.abs(weight - oldWeight).toFixed(3)}
                  </text>
                )}
                {gradient !== null && currentStep === 6 && (
                  <text
                    x={540}
                    y={155 + j * 80}
                    fontSize="10"
                    fill="#9C27B0"
                    fontWeight="bold"
                  >
                    ∇={gradient.toFixed(3)}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Sample input-hidden weights */}
          {[0, 1, 2].map(i => {
            const weight = displayWeights.inputToHidden[i][0];
            const oldWeight = showWeightChange ? animationWeights.old.inputToHidden[i][0] : weight;
            const gradient = currentStep === 6 ? flowData.backward.hiddenGradients[i][0] : null;
            
            return (
              <g key={`weight-ih-${i}`}>
                <text
                  x={220}
                  y={160 + i * 100}
                  fontSize="10"
                  fill={showWeightChange && weight !== oldWeight ? 
                    (weight < oldWeight ? "#F44336" : "#4CAF50") : "#333"}
                  fontWeight="bold"
                  textAnchor="middle"
                  className={showWeightChange ? "weight-updating" : ""}
                >
                  w={weight.toFixed(2)}
                </text>
                {gradient !== null && currentStep === 6 && (
                  <text
                    x={270}
                    y={160 + i * 100}
                    fontSize="10"
                    fill="#FF9800"
                    fontWeight="bold"
                  >
                    ∇={gradient.toFixed(3)}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Step indicators */}
          <text x={450} y={30} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333">
            {steps[currentStep].title}
          </text>
          
          {/* Legend */}
          <g transform="translate(50, 500)">
            <text x={0} y={0} fontSize="12" fontWeight="bold" fill="#333">Legend:</text>
            <circle cx={15} cy={20} r={8} fill="#4CAF50"/>
            <text x={30} y={25} fontSize="10" fill="#333">Forward Flow</text>
            <line x1={120} y1={20} x2={150} y2={20} stroke="#F44336" strokeWidth="3" strokeDasharray="3,3"/>
            <text x={160} y={25} fontSize="10" fill="#333">Error Backflow</text>
            <text x={250} y={25} fontSize="10" fill="#333">δ = Error × Derivative</text>
            <text x={400} y={25} fontSize="10" fill="#333">∇w = Gradient</text>
          </g>
        </svg>
      </div>
      
      <div className="step-details">
        <div className="details-grid">
          <div className="detail-card">
            <h5>Forward Values</h5>
            <p>Output: {flowData.forward.output.toFixed(4)}</p>
            <p>Hidden: [{flowData.forward.hiddenActivated.map(h => h.toFixed(2)).join(', ')}]</p>
          </div>
          
          {currentStep >= 1 && (
            <div className="detail-card error-card">
              <h5>Error Analysis</h5>
              <p>Output Error: {flowData.backward.outputError.toFixed(4)}</p>
              <p>MSE: {(0.5 * flowData.backward.outputError ** 2).toFixed(6)}</p>
            </div>
          )}
          
          {currentStep >= 4 && (
            <div className="detail-card delta-card">
              <h5>Hidden Deltas</h5>
              {flowData.backward.hiddenDeltas.map((delta, i) => (
                <p key={i}>δ{i+1}: {delta.toFixed(4)}</p>
              ))}
            </div>
          )}
          
          {currentStep >= 5 && (
            <div className="detail-card gradient-card">
              <h5>🔙 Current Gradients</h5>
              <div className="gradient-values">
                <p><strong>Output Layer:</strong></p>
                {flowData.backward.outputGradients.map((grad, i) => (
                  <span key={i} className="gradient-value">
                    ∇w{i+1}: {grad.toFixed(4)}
                  </span>
                ))}
                
                <p><strong>Hidden Layer (first neuron):</strong></p>
                {flowData.backward.hiddenGradients.map((grad, i) => (
                  <span key={i} className="gradient-value">
                    ∇w{i+1}h1: {grad[0].toFixed(4)}
                  </span>
                ))}
              </div>
              <p>Learning Rate: α = {learningRate}</p>
            </div>
          )}
          
          {showWeightChange && animationWeights && (
            <div className="detail-card update-card">
              <h5>Weight Updates (α = {learningRate})</h5>
              <div className="weight-update-example">
                <p><strong>Example calculation:</strong></p>
                <p className="calculation">
                  w_new = w_old - α × ∇w
                </p>
                <p className="calculation">
                  {animationWeights.old.hiddenToOutput[0][0].toFixed(3)} - 
                  {learningRate} × {animationWeights.gradients.outputGradients[0].toFixed(3)} = 
                  {animationWeights.new.hiddenToOutput[0][0].toFixed(3)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackpropagationFlow; 