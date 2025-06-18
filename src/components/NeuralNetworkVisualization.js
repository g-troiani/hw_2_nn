import React from 'react';
import './NeuralNetworkVisualization.css';

const NeuralNetworkVisualization = ({ networkState, inputData }) => {
  const { weights, activations, isAnimating } = networkState;
  
  // SVG dimensions and positioning
  const svgWidth = 600;
  const svgHeight = 400;
  const nodeRadius = 20;
  
  // Layer positions
  const inputLayer = { x: 50, nodeCount: 3, labels: ['Temp °C', 'Precip %', 'CO2 ppm'] };
  const hiddenLayer = { x: 200, nodeCount: 4, labels: ['H1', 'H2', 'H3', 'H4'] };
  const outputLayer = { x: 350, nodeCount: 1, labels: ['Impact'] };
  
  // Calculate node positions
  const getNodePositions = (layer, svgHeight) => {
    const positions = [];
    const spacing = Math.min(60, (svgHeight - 100) / Math.max(1, layer.nodeCount - 1));
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
  
  // Calculate connection opacity based on weight and activation
  const getConnectionOpacity = (weight, fromActivation) => {
    const baseOpacity = Math.abs(weight) * 0.5 + 0.1;
    const activationMultiplier = isAnimating ? Math.abs(fromActivation) + 0.3 : 0.3;
    return Math.min(1, baseOpacity * activationMultiplier);
  };
  
  // Calculate connection thickness based on weight magnitude
  const getConnectionThickness = (weight, fromActivation) => {
    const baseThickness = Math.abs(weight) * 3 + 1;
    const activationMultiplier = isAnimating ? Math.abs(fromActivation) + 0.5 : 0.5;
    return Math.min(5, baseThickness * activationMultiplier);
  };
  
  // Get node color based on activation value
  const getNodeColor = (activation, isActive = false) => {
    if (!isActive && !isAnimating) return '#e0e0e0';
    
    const intensity = Math.abs(activation);
    const hue = activation >= 0 ? 120 : 0; // Green for positive, red for negative
    const saturation = Math.min(100, intensity * 100 + 20);
    const lightness = Math.max(20, 100 - intensity * 60);
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <div className="neural-network-container">
      <h3>🧠 Neural Network Architecture</h3>
      <div className="network-info">
        <p>3 Inputs → 4 Hidden Neurons → 1 Output</p>
        <p>Activation: ReLU (Hidden), Sigmoid (Output)</p>
      </div>
      
      <svg width={svgWidth} height={svgHeight} className="network-svg">
        {/* Input to Hidden connections */}
        {inputNodes.map((inputNode, i) => {
          // Calculate real-time normalized input for connection effects
          const normalizedInputs = [
            inputData.temperatureChange / 4,
            inputData.precipitationChange / 30,
            (inputData.co2Level - 400) / 400
          ];
          
          return hiddenNodes.map((hiddenNode, j) => {
            const weight = weights.inputToHidden[i][j];
            const activation = normalizedInputs[i];
            return (
              <g key={`input-hidden-${i}-${j}`}>
                <line
                  x1={inputNode.x + nodeRadius}
                  y1={inputNode.y}
                  x2={hiddenNode.x - nodeRadius}
                  y2={hiddenNode.y}
                  stroke={weight >= 0 ? '#4CAF50' : '#F44336'}
                  strokeWidth={getConnectionThickness(weight, activation)}
                  opacity={getConnectionOpacity(weight, activation)}
                  className={isAnimating ? 'animating-connection' : ''}
                />
                {/* Weight label on hover */}
                <text
                  x={(inputNode.x + hiddenNode.x) / 2}
                  y={(inputNode.y + hiddenNode.y) / 2 - 5}
                  fontSize="10"
                  fill="#666"
                  textAnchor="middle"
                  className="weight-label"
                >
                  {weight.toFixed(2)}
                </text>
              </g>
            );
          });
        })}
        
        {/* Hidden to Output connections */}
        {hiddenNodes.map((hiddenNode, i) =>
          outputNodes.map((outputNode, j) => {
            const weight = weights.hiddenToOutput[i][j];
            const activation = activations.hidden[i];
            return (
              <g key={`hidden-output-${i}-${j}`}>
                <line
                  x1={hiddenNode.x + nodeRadius}
                  y1={hiddenNode.y}
                  x2={outputNode.x - nodeRadius}
                  y2={outputNode.y}
                  stroke={weight >= 0 ? '#4CAF50' : '#F44336'}
                  strokeWidth={getConnectionThickness(weight, activation)}
                  opacity={getConnectionOpacity(weight, activation)}
                  className={isAnimating ? 'animating-connection' : ''}
                />
                <text
                  x={(hiddenNode.x + outputNode.x) / 2}
                  y={(hiddenNode.y + outputNode.y) / 2 - 5}
                  fontSize="10"
                  fill="#666"
                  textAnchor="middle"
                  className="weight-label"
                >
                  {weight.toFixed(2)}
                </text>
              </g>
            );
          })
        )}
        
        {/* Input layer nodes */}
        {inputNodes.map((node, i) => {
          // Get actual input values for display and normalization for color
          const actualValues = [
            inputData.temperatureChange,
            inputData.precipitationChange, 
            inputData.co2Level
          ];
          
          // Calculate normalized values for consistent coloring
          const normalizedForColor = [
            inputData.temperatureChange / 4,
            inputData.precipitationChange / 30,
            (inputData.co2Level - 400) / 400
          ];
          
          return (
            <g key={`input-${i}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeRadius}
                fill={getNodeColor(normalizedForColor[i], true)}
                stroke="#333"
                strokeWidth="2"
                className={isAnimating ? 'animating-node' : ''}
              />
              <text
                x={node.x}
                y={node.y + 5}
                fontSize="9"
                fill="#333"
                textAnchor="middle"
                fontWeight="bold"
              >
                {actualValues[i].toFixed(i === 2 ? 0 : 1)}{i === 0 ? '°C' : i === 1 ? '%' : ''}
              </text>
              <text
                x={node.x}
                y={node.y - nodeRadius - 10}
                fontSize="12"
                fill="#333"
                textAnchor="middle"
                fontWeight="bold"
              >
                {node.label}
              </text>
            </g>
          );
        })}
        
        {/* Hidden layer nodes */}
        {hiddenNodes.map((node, i) => (
          <g key={`hidden-${i}`}>
            <circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius}
              fill={getNodeColor(activations.hidden[i], activations.hidden[i] > 0)}
              stroke="#333"
              strokeWidth="2"
              className={isAnimating ? 'animating-node' : ''}
            />
            <text
              x={node.x}
              y={node.y + 5}
              fontSize="10"
              fill="#333"
              textAnchor="middle"
              fontWeight="bold"
            >
              {activations.hidden[i].toFixed(2)}
            </text>
            <text
              x={node.x}
              y={node.y - nodeRadius - 10}
              fontSize="12"
              fill="#333"
              textAnchor="middle"
              fontWeight="bold"
            >
              {node.label}
            </text>
          </g>
        ))}
        
        {/* Output layer nodes */}
        {outputNodes.map((node, i) => (
          <g key={`output-${i}`}>
            <circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius * 1.2}
              fill={getNodeColor(activations.output[i], true)}
              stroke="#333"
              strokeWidth="3"
              className={isAnimating ? 'animating-node' : ''}
            />
            <text
              x={node.x}
              y={node.y + 5}
              fontSize="12"
              fill="#333"
              textAnchor="middle"
              fontWeight="bold"
            >
              {activations.output[i].toFixed(3)}
            </text>
            <text
              x={node.x}
              y={node.y - nodeRadius * 1.2 - 10}
              fontSize="12"
              fill="#333"
              textAnchor="middle"
              fontWeight="bold"
            >
              {node.label}
            </text>
          </g>
        ))}
        
        {/* Layer labels */}
        <text x={inputLayer.x} y={30} fontSize="14" fontWeight="bold" textAnchor="middle" fill="#333">
          Input Layer
        </text>
        <text x={hiddenLayer.x} y={30} fontSize="14" fontWeight="bold" textAnchor="middle" fill="#333">
          Hidden Layer
        </text>
        <text x={outputLayer.x} y={30} fontSize="14" fontWeight="bold" textAnchor="middle" fill="#333">
          Output Layer
        </text>
      </svg>
      
      {isAnimating && (
        <div className="animation-indicator">
          <div className="pulse-animation">🔄 Forward Propagation in Progress...</div>
        </div>
      )}
    </div>
  );
};

export default NeuralNetworkVisualization; 