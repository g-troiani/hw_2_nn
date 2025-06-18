import React, { useState } from 'react';
import './App.css';
import NeuralNetworkVisualization from './components/NeuralNetworkVisualization';
import DataInputPanel from './components/DataInputPanel';
import PropagationSteps from './components/PropagationSteps';
import ResultsPanel from './components/ResultsPanel';

function App() {
  const [inputData, setInputData] = useState({
    temperatureChange: 0,
    precipitationChange: 0,
    co2Level: 400
  });
  
  const [networkState, setNetworkState] = useState({
    weights: {
      inputToHidden: [
        [0.1, 0.2, -0.1, 0.15],
        [-0.15, 0.25, 0.1, -0.2], 
        [0.05, -0.1, -0.15, 0.3]
      ],
      hiddenToOutput: [[0.4], [0.3], [-0.5], [0.2]]
    },
    activations: {
      input: [0, 0, 0],
      hidden: [0, 0, 0, 0],
      output: [0]
    },
    isAnimating: false
  });
  
  const [calculationSteps, setCalculationSteps] = useState([]);

  // Neural network forward propagation with ReLU activation
  const forwardPropagate = (inputs) => {
    const steps = [];
    
    // Normalize inputs
    const normalizedInputs = [
      inputs.temperatureChange / 4, // Scale -2 to +4 -> -0.5 to +1
      inputs.precipitationChange / 30, // Scale -30% to +30% -> -1 to +1
      (inputs.co2Level - 400) / 400 // Scale 400-800 -> 0 to 1
    ];
    
    steps.push({
      type: 'input',
      description: 'Input Layer Activation',
      values: normalizedInputs,
      calculation: `Temperature: ${inputs.temperatureChange}°C → ${normalizedInputs[0].toFixed(3)}
Precipitation: ${inputs.precipitationChange}% → ${normalizedInputs[1].toFixed(3)}
CO2: ${inputs.co2Level}ppm → ${normalizedInputs[2].toFixed(3)}`
    });

    // Calculate hidden layer
    const hiddenRaw = [];
    for (let hiddenIdx = 0; hiddenIdx < 4; hiddenIdx++) {
      const weightedSum = normalizedInputs.reduce((sum, input, inputIdx) => {
        return sum + input * networkState.weights.inputToHidden[inputIdx][hiddenIdx];
      }, 0);
      hiddenRaw.push(weightedSum);
    }
    
    // Apply ReLU activation
    const hiddenActivated = hiddenRaw.map(val => Math.max(0, val));
    
    steps.push({
      type: 'hidden',
      description: 'Hidden Layer Calculation',
      values: hiddenActivated,
      calculation: hiddenRaw.map((raw, idx) => 
        `Hidden${idx + 1}: ${raw.toFixed(3)} → ReLU → ${hiddenActivated[idx].toFixed(3)}`
      ).join('\n')
    });

    // Calculate output layer
    const outputRaw = hiddenActivated.reduce((sum, hidden, idx) => {
      return sum + hidden * networkState.weights.hiddenToOutput[idx][0];
    }, 0);
    
    // Apply sigmoid to get probability between 0 and 1
    const outputActivated = 1 / (1 + Math.exp(-outputRaw));
    
    steps.push({
      type: 'output',
      description: 'Output Layer Calculation',
      values: [outputActivated],
      calculation: `Weighted Sum: ${outputRaw.toFixed(3)}
Sigmoid Activation: 1/(1+e^(-${outputRaw.toFixed(3)})) = ${outputActivated.toFixed(3)}
Biodiversity Impact Score: ${(outputActivated * 100).toFixed(1)}%`
    });

    return {
      input: normalizedInputs,
      hidden: hiddenActivated,
      output: [outputActivated],
      steps: steps
    };
  };

  const runPropagation = () => {
    setNetworkState(prev => ({ ...prev, isAnimating: true }));
    
    const result = forwardPropagate(inputData);
    setCalculationSteps(result.steps);
    
    // Animate the propagation
    setTimeout(() => {
      setNetworkState(prev => ({
        ...prev,
        activations: {
          input: result.input,
          hidden: result.hidden,
          output: result.output
        }
      }));
    }, 500);
    
    setTimeout(() => {
      setNetworkState(prev => ({ ...prev, isAnimating: false }));
    }, 2000);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌍 Climate Impact Predictor</h1>
        <p>Neural Network Forward Propagation Visualizer</p>
      </header>
      
      <main className="main-content">
        <div className="left-panel">
          <DataInputPanel 
            inputData={inputData}
            setInputData={setInputData}
            onRunPropagation={runPropagation}
            isAnimating={networkState.isAnimating}
          />
          
          <PropagationSteps 
            steps={calculationSteps}
            isAnimating={networkState.isAnimating}
          />
        </div>
        
        <div className="center-panel">
          <NeuralNetworkVisualization 
            networkState={networkState}
            inputData={inputData}
          />
        </div>
        
        <div className="right-panel">
          <ResultsPanel 
            outputValue={networkState.activations.output[0]}
            inputData={inputData}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
