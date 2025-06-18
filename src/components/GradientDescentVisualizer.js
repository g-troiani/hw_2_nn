import React, { useState, useEffect, useRef } from 'react';
import './GradientDescentVisualizer.css';

const GradientDescentVisualizer = ({ inputData }) => {
  // Initial weights - start with smaller random values for better learning
  const getInitialWeights = () => ({
    inputToHidden: [
      [Math.random() * 0.4 - 0.2, Math.random() * 0.4 - 0.2, Math.random() * 0.4 - 0.2, Math.random() * 0.4 - 0.2],
      [Math.random() * 0.4 - 0.2, Math.random() * 0.4 - 0.2, Math.random() * 0.4 - 0.2, Math.random() * 0.4 - 0.2],
      [Math.random() * 0.4 - 0.2, Math.random() * 0.4 - 0.2, Math.random() * 0.4 - 0.2, Math.random() * 0.4 - 0.2]
    ],
    hiddenToOutput: [[Math.random() * 0.4 - 0.2], [Math.random() * 0.4 - 0.2], [Math.random() * 0.4 - 0.2], [Math.random() * 0.4 - 0.2]]
  });

  const [currentWeights, setCurrentWeights] = useState(getInitialWeights());
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [learningRate, setLearningRate] = useState(0.1); // Increased default learning rate
  const [targetOutput, setTargetOutput] = useState(0.8);
  const [showGradients, setShowGradients] = useState(false);
  const [gradients, setGradients] = useState({});
  const [currentPrediction, setCurrentPrediction] = useState(0);
  const [currentError, setCurrentError] = useState(0);
  
  // Use ref to track training state
  const trainingRef = useRef(false);
  const weightsRef = useRef(currentWeights);
  
  // Update weights ref when weights change
  useEffect(() => {
    weightsRef.current = currentWeights;
  }, [currentWeights]);
  
  // Forward propagation function
  const forwardPass = (inputs, weights) => {
    // Normalize inputs
    const normalizedInputs = [
      (inputs.temperatureChange + 2) / 6,  // -2 to 4 → 0 to 1
      (inputs.precipitationChange + 30) / 60,  // -30 to 30 → 0 to 1
      (inputs.co2Level - 400) / 400  // 400 to 800 → 0 to 1
    ];
    
    // Hidden layer calculation
    const hiddenRaw = [];
    for (let j = 0; j < 4; j++) {
      let sum = 0;
      for (let i = 0; i < 3; i++) {
        sum += normalizedInputs[i] * weights.inputToHidden[i][j];
      }
      hiddenRaw.push(sum);
    }
    
    // Apply ReLU activation
    const hiddenActivated = hiddenRaw.map(val => Math.max(0, val));
    
    // Output layer calculation
    let outputRaw = 0;
    for (let i = 0; i < 4; i++) {
      outputRaw += hiddenActivated[i] * weights.hiddenToOutput[i][0];
    }
    
    // Apply sigmoid activation
    const output = 1 / (1 + Math.exp(-outputRaw));
    
    return {
      normalizedInputs,
      hiddenRaw,
      hiddenActivated,
      outputRaw,
      output
    };
  };
  
  // Backpropagation function
  const backpropagation = (inputs, target, weights) => {
    const forward = forwardPass(inputs, weights);
    const { normalizedInputs, hiddenRaw, hiddenActivated, output } = forward;
    
    // Calculate error
    const error = output - target;
    const mse = 0.5 * error * error;
    
    // Output layer gradients (using chain rule)
    const sigmoidDerivative = output * (1 - output);
    const outputDelta = error * sigmoidDerivative;
    
    // Hidden layer gradients
    const hiddenDeltas = [];
    for (let j = 0; j < 4; j++) {
      const hiddenError = outputDelta * weights.hiddenToOutput[j][0];
      const reluDerivative = hiddenRaw[j] > 0 ? 1 : 0;
      hiddenDeltas.push(hiddenError * reluDerivative);
    }
    
    // Calculate weight gradients
    const gradients = {
      hiddenToOutput: hiddenActivated.map(h => [h * outputDelta]),
      inputToHidden: normalizedInputs.map(input => 
        hiddenDeltas.map(delta => input * delta)
      )
    };
    
    return {
      error: mse,
      gradients,
      prediction: output,
      outputDelta,
      hiddenDeltas,
      forward
    };
  };
  
  // Update forward pass result whenever weights or inputs change
  useEffect(() => {
    const result = forwardPass(inputData, currentWeights);
    setCurrentPrediction(result.output);
    setCurrentError(0.5 * (result.output - targetOutput) ** 2);
  }, [currentWeights, inputData, targetOutput]);
  
  // Single training step
  const performTrainingStep = (weights, iteration) => {
    const result = backpropagation(inputData, targetOutput, weights);
    
    // Update weights using gradient descent
    const newWeights = {
      hiddenToOutput: [],
      inputToHidden: []
    };
    
    // Update hidden to output weights
    for (let i = 0; i < 4; i++) {
      const oldWeight = weights.hiddenToOutput[i][0];
      const gradient = result.gradients.hiddenToOutput[i][0];
      const newWeight = oldWeight - learningRate * gradient;
      newWeights.hiddenToOutput.push([newWeight]);
    }
    
    // Update input to hidden weights
    for (let i = 0; i < 3; i++) {
      newWeights.inputToHidden.push([]);
      for (let j = 0; j < 4; j++) {
        const oldWeight = weights.inputToHidden[i][j];
        const gradient = result.gradients.inputToHidden[i][j];
        const newWeight = oldWeight - learningRate * gradient;
        newWeights.inputToHidden[i].push(newWeight);
      }
    }
    
    // Update gradients display
    setGradients(result.gradients);
    
    // Create history entry
    const historyEntry = {
      iteration: iteration,
      error: result.error,
      prediction: result.prediction,
      weights: JSON.parse(JSON.stringify(newWeights))
    };
    
    return { newWeights, historyEntry, error: result.error };
  };
  
  // Run continuous training
  const runTraining = () => {
    if (trainingRef.current) return;
    
    trainingRef.current = true;
    setIsTraining(true);
    setShowGradients(true);
    setTrainingHistory([]);
    setCurrentIteration(0);
    
    let iteration = 0;
    let weights = JSON.parse(JSON.stringify(weightsRef.current));
    let history = [];
    
    const trainStep = () => {
      if (!trainingRef.current || iteration >= 100) { // Increased to 100 iterations
        trainingRef.current = false;
        setIsTraining(false);
        return;
      }
      
      const { newWeights, historyEntry, error } = performTrainingStep(weights, iteration);
      
      // Update states
      weights = newWeights;
      history = [...history, historyEntry];
      
      setCurrentWeights(newWeights);
      setTrainingHistory(history);
      setCurrentIteration(iteration + 1);
      
      iteration++;
      
      // Stop if error is very small
      if (error < 0.0001) {
        trainingRef.current = false;
        setIsTraining(false);
        console.log('Training converged at iteration', iteration);
        return;
      }
      
      // Continue training with shorter delay for faster visualization
      setTimeout(trainStep, 50);
    };
    
    // Start training
    trainStep();
  };
  
  // Stop training
  const stopTraining = () => {
    trainingRef.current = false;
    setIsTraining(false);
  };
  
  // Single step
  const singleStep = () => {
    if (!isTraining) {
      setShowGradients(true);
      const { newWeights, historyEntry } = performTrainingStep(currentWeights, currentIteration);
      
      setCurrentWeights(newWeights);
      setTrainingHistory(prev => [...prev, historyEntry]);
      setCurrentIteration(prev => prev + 1);
    }
  };
  
  // Reset training
  const resetTraining = () => {
    trainingRef.current = false;
    setIsTraining(false);
    const newWeights = getInitialWeights();
    setCurrentWeights(newWeights);
    setTrainingHistory([]);
    setCurrentIteration(0);
    setShowGradients(false);
    setGradients({});
  };
  
  // Neural Network Visualization Component
  const NetworkVisualization = () => {
    const svgWidth = 500;
    const svgHeight = 300;
    const nodeRadius = 15;
    
    const inputLayer = { x: 50, nodeCount: 3, labels: ['Temp', 'Precip', 'CO2'] };
    const hiddenLayer = { x: 200, nodeCount: 4, labels: ['H1', 'H2', 'H3', 'H4'] };
    const outputLayer = { x: 350, nodeCount: 1, labels: ['Output'] };
    
    const getNodePositions = (layer, svgHeight) => {
      const positions = [];
      const spacing = Math.min(50, (svgHeight - 80) / Math.max(1, layer.nodeCount - 1));
      const startY = (svgHeight - (layer.nodeCount - 1) * spacing) / 2;
      
      for (let i = 0; i < layer.nodeCount; i++) {
        positions.push({
          x: layer.x,
          y: startY + i * spacing,
          label: layer.labels[i]
        });
      }
      return positions;
    };
    
    const inputNodes = getNodePositions(inputLayer, svgHeight);
    const hiddenNodes = getNodePositions(hiddenLayer, svgHeight);
    const outputNodes = getNodePositions(outputLayer, svgHeight);
    
    const forward = forwardPass(inputData, currentWeights);
    
    const getNodeColor = (activation, isActive = true) => {
      if (!isActive) return '#e0e0e0';
      
      const intensity = Math.abs(activation);
      const hue = activation >= 0 ? 120 : 0;
      const saturation = Math.min(100, intensity * 100 + 20);
      const lightness = Math.max(30, 100 - intensity * 60);
      
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };
    
    const getConnectionProps = (weight, fromActivation = 1) => {
      const baseOpacity = Math.abs(weight) * 0.3 + 0.2;
      const thickness = Math.abs(weight) * 3 + 1;
      const color = weight >= 0 ? '#4CAF50' : '#F44336';
      
      return {
        opacity: Math.min(1, baseOpacity * Math.abs(fromActivation) + 0.3),
        strokeWidth: Math.min(5, thickness),
        stroke: color
      };
    };
    
    return (
      <div className="network-visualization">
        <h4>🧠 Live Neural Network</h4>
        <svg width={svgWidth} height={svgHeight} className="network-svg">
          {/* Input to Hidden connections */}
          {inputNodes.map((inputNode, i) =>
            hiddenNodes.map((hiddenNode, j) => {
              const weight = currentWeights.inputToHidden[i][j];
              const props = getConnectionProps(weight, forward.normalizedInputs[i]);
              return (
                <g key={`input-hidden-${i}-${j}`}>
                  <line
                    x1={inputNode.x + nodeRadius}
                    y1={inputNode.y}
                    x2={hiddenNode.x - nodeRadius}
                    y2={hiddenNode.y}
                    {...props}
                  />
                  {/* Only show weights on hover or when training */}
                  {(showGradients || !isTraining) && (
                    <text
                      x={(inputNode.x + hiddenNode.x) / 2}
                      y={(inputNode.y + hiddenNode.y) / 2 - 5}
                      fontSize="9"
                      fill="#333"
                      textAnchor="middle"
                      fontWeight="bold"
                      className="weight-display"
                    >
                      {weight.toFixed(3)}
                    </text>
                  )}
                </g>
              );
            })
          )}
          
          {/* Hidden to Output connections */}
          {hiddenNodes.map((hiddenNode, i) =>
            outputNodes.map((outputNode, j) => {
              const weight = currentWeights.hiddenToOutput[i][j];
              const props = getConnectionProps(weight, forward.hiddenActivated[i]);
              return (
                <g key={`hidden-output-${i}-${j}`}>
                  <line
                    x1={hiddenNode.x + nodeRadius}
                    y1={hiddenNode.y}
                    x2={outputNode.x - nodeRadius}
                    y2={outputNode.y}
                    {...props}
                  />
                  {(showGradients || !isTraining) && (
                    <text
                      x={(hiddenNode.x + outputNode.x) / 2}
                      y={(hiddenNode.y + outputNode.y) / 2 - 5}
                      fontSize="9"
                      fill="#333"
                      textAnchor="middle"
                      fontWeight="bold"
                      className="weight-display"
                    >
                      {weight.toFixed(3)}
                    </text>
                  )}
                </g>
              );
            })
          )}
          
          {/* Input nodes */}
          {inputNodes.map((node, i) => {
            const actualValues = [
              inputData.temperatureChange,
              inputData.precipitationChange, 
              inputData.co2Level
            ];
            
            return (
              <g key={`input-${i}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill={getNodeColor(forward.normalizedInputs[i], true)}
                  stroke="#333"
                  strokeWidth="2"
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  fontSize="10"
                  fill="#333"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {actualValues[i].toFixed(i === 2 ? 0 : 1)}
                </text>
                <text
                  x={node.x}
                  y={node.y - nodeRadius - 8}
                  fontSize="11"
                  fill="#333"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
          
          {/* Hidden nodes */}
          {hiddenNodes.map((node, i) => (
            <g key={`hidden-${i}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeRadius}
                fill={getNodeColor(forward.hiddenActivated[i], forward.hiddenActivated[i] > 0)}
                stroke="#333"
                strokeWidth="2"
              />
              <text
                x={node.x}
                y={node.y + 4}
                fontSize="9"
                fill="#333"
                textAnchor="middle"
                fontWeight="bold"
              >
                {forward.hiddenActivated[i].toFixed(2)}
              </text>
              <text
                x={node.x}
                y={node.y - nodeRadius - 8}
                fontSize="11"
                fill="#333"
                textAnchor="middle"
                fontWeight="bold"
              >
                {node.label}
              </text>
            </g>
          ))}
          
          {/* Output node */}
          {outputNodes.map((node, i) => (
            <g key={`output-${i}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeRadius * 1.2}
                fill={getNodeColor(currentPrediction, true)}
                stroke="#333"
                strokeWidth="3"
              />
              <text
                x={node.x}
                y={node.y + 4}
                fontSize="11"
                fill="#333"
                textAnchor="middle"
                fontWeight="bold"
              >
                {currentPrediction.toFixed(3)}
              </text>
              <text
                x={node.x}
                y={node.y - nodeRadius * 1.2 - 10}
                fontSize="11"
                fill="#333"
                textAnchor="middle"
                fontWeight="bold"
              >
                {node.label}
              </text>
            </g>
          ))}
          
          {/* Target indicator */}
          <g>
            <rect
              x={420}
              y={outputNodes[0].y - 15}
              width={60}
              height={30}
              fill="#4CAF50"
              stroke="#333"
              strokeWidth="2"
              rx="5"
            />
            <text
              x={450}
              y={outputNodes[0].y - 5}
              fontSize="9"
              fill="#333"
              textAnchor="middle"
              fontWeight="bold"
            >
              Target
            </text>
            <text
              x={450}
              y={outputNodes[0].y + 8}
              fontSize="11"
              fill="#333"
              textAnchor="middle"
              fontWeight="bold"
            >
              {targetOutput.toFixed(2)}
            </text>
          </g>
          
          {/* Layer labels */}
          <text x={inputLayer.x} y={25} fontSize="12" fontWeight="bold" textAnchor="middle" fill="#333">
            Input Layer
          </text>
          <text x={hiddenLayer.x} y={25} fontSize="12" fontWeight="bold" textAnchor="middle" fill="#333">
            Hidden Layer (ReLU)
          </text>
          <text x={outputLayer.x} y={25} fontSize="12" fontWeight="bold" textAnchor="middle" fill="#333">
            Output (Sigmoid)
          </text>
        </svg>
      </div>
    );
  };
  
  return (
    <div className="gradient-descent-visualizer">
      <h3>🎯 Gradient Descent & Backpropagation Trainer</h3>
      
      <NetworkVisualization />
      
      <div className="training-controls">
        <div className="control-row">
          <label>
            Target Output: 
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={targetOutput}
              onChange={(e) => setTargetOutput(parseFloat(e.target.value))}
              disabled={isTraining}
            />
            <span>{targetOutput.toFixed(1)}</span>
          </label>
          
          <label>
            Learning Rate: 
            <input 
              type="range" 
              min="0.001" 
              max="0.5" 
              step="0.001" 
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              disabled={isTraining}
            />
            <span>{learningRate.toFixed(3)}</span>
          </label>
        </div>
        
        <div className="control-buttons">
          <button 
            onClick={runTraining} 
            disabled={isTraining}
            className="train-button"
          >
            {isTraining ? '🔄 Training...' : '🚀 Start Training'}
          </button>
          
          <button 
            onClick={stopTraining} 
            disabled={!isTraining}
            className="stop-button"
          >
            ⏹️ Stop Training
          </button>
          
          <button 
            onClick={singleStep} 
            disabled={isTraining}
            className="step-button"
          >
            📈 Single Step
          </button>
          
          <button 
            onClick={resetTraining} 
            disabled={isTraining}
            className="reset-button"
          >
            🔄 Reset
          </button>
        </div>
      </div>
      
      <div className="training-metrics">
        <div className="metric-card">
          <h4>Current Status</h4>
          <p>Iteration: <strong>{currentIteration}</strong></p>
          <p>Prediction: <strong>{currentPrediction.toFixed(4)}</strong></p>
          <p>Target: <strong>{targetOutput.toFixed(4)}</strong></p>
          <p>Error (MSE): <strong>{currentError.toFixed(6)}</strong></p>
          <p>Training: <strong>{isTraining ? 'Active' : 'Stopped'}</strong></p>
          <p>Learning Rate: <strong>{learningRate.toFixed(3)}</strong></p>
        </div>
        
        {showGradients && gradients.hiddenToOutput && (
          <div className="gradient-info">
            <h4>🔙 Current Gradients</h4>
            <div className="gradient-values">
              <p><strong>Output Layer:</strong></p>
              {gradients.hiddenToOutput.map((grad, i) => (
                <span key={i} className="gradient-value">
                  ∇w{i+1}: {grad[0].toFixed(4)}
                </span>
              ))}
              
              <p><strong>Hidden Layer (first neuron):</strong></p>
              {gradients.inputToHidden.map((grad, i) => (
                <span key={i} className="gradient-value">
                  ∇w{i+1}h1: {grad[0].toFixed(4)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {trainingHistory.length > 0 && (
        <div className="error-graph">
          <h4>📊 Training Progress</h4>
          <svg width="400" height="200" className="error-plot">
            <rect width="400" height="200" fill="#f8f9fa" stroke="#dee2e6"/>
            
            {/* Y-axis labels */}
            {trainingHistory.length > 0 && (() => {
              const errors = trainingHistory.map(e => e.error);
              const maxError = Math.max(...errors);
              const minError = Math.min(...errors);
              const range = maxError - minError;
              
              return [0, 0.25, 0.5, 0.75, 1].map(i => {
                const value = minError + range * (1 - i);
                const y = 10 + i * 180;
                return (
                  <g key={i}>
                    <line x1="35" y1={y} x2="40" y2={y} stroke="#666" />
                    <text x="30" y={y + 4} textAnchor="end" fontSize="10" fill="#666">
                      {value.toFixed(4)}
                    </text>
                  </g>
                );
              });
            })()}
            
            {/* X-axis labels */}
            <text x="40" y="195" fontSize="10" fill="#666">0</text>
            <text x="390" y="195" fontSize="10" fill="#666">{trainingHistory.length}</text>
            
            {/* Plot error curve with proper scaling */}
            {trainingHistory.length > 1 && (() => {
              const errors = trainingHistory.map(e => e.error);
              const maxError = Math.max(...errors);
              const minError = Math.min(...errors);
              const range = maxError - minError || 0.0001;
              
              const points = trainingHistory.map((entry, i) => {
                const x = 40 + (i / Math.max(1, trainingHistory.length - 1)) * 350;
                const normalizedError = (entry.error - minError) / range;
                const y = 190 - normalizedError * 180;
                return `${x},${y}`;
              }).join(' ');
              
              return (
                <polyline
                  points={points}
                  fill="none"
                  stroke="#e74c3c"
                  strokeWidth="2"
                />
              );
            })()}
            
            {/* Axis labels */}
            <text x="200" y="15" textAnchor="middle" fontSize="12" fill="#666">
              Error
            </text>
            <text x="200" y="195" textAnchor="middle" fontSize="12" fill="#666">
              Training Iterations
            </text>
            
            {/* Current point */}
            {trainingHistory.length > 0 && (() => {
              const errors = trainingHistory.map(e => e.error);
              const maxError = Math.max(...errors);
              const minError = Math.min(...errors);
              const range = maxError - minError || 0.0001;
              const lastEntry = trainingHistory[trainingHistory.length - 1];
              const x = 40 + ((trainingHistory.length - 1) / Math.max(1, trainingHistory.length - 1)) * 350;
              const normalizedError = (lastEntry.error - minError) / range;
              const y = 190 - normalizedError * 180;
              
              return (
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#e74c3c"
                  stroke="#fff"
                  strokeWidth="2"
                />
              );
            })()}
          </svg>
          
          {/* Show error range */}
          {trainingHistory.length > 1 && (
            <div className="error-stats">
              <p>Initial Error: <strong>{trainingHistory[0].error.toFixed(6)}</strong></p>
              <p>Current Error: <strong>{trainingHistory[trainingHistory.length - 1].error.toFixed(6)}</strong></p>
              <p>Improvement: <strong>{((1 - trainingHistory[trainingHistory.length - 1].error / trainingHistory[0].error) * 100).toFixed(1)}%</strong></p>
            </div>
          )}
        </div>
      )}
      
      <div className="learning-insights">
        <h4>🧠 Learning Insights</h4>
        <div className="insights-grid">
          <div className="insight-card">
            <h5>Gradient Descent</h5>
            <p>Weights move in the direction that reduces error. Larger gradients = bigger weight changes.</p>
          </div>
          
          <div className="insight-card">
            <h5>Learning Rate</h5>
            <p>Controls step size. Too large → overshooting, too small → slow convergence.</p>
          </div>
          
          <div className="insight-card">
            <h5>Backpropagation</h5>
            <p>Error flows backward through the network, updating each layer's weights proportionally.</p>
          </div>
          
          <div className="insight-card">
            <h5>Loss Landscape</h5>
            <p>The network navigates through weight space to find the minimum error configuration.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradientDescentVisualizer; 