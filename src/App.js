import React, { useState } from 'react';
import './App.css';
import NeuralNetworkVisualization from './components/NeuralNetworkVisualization';
import DataInputPanel from './components/DataInputPanel';
import PropagationSteps from './components/PropagationSteps';
import ResultsPanel from './components/ResultsPanel';
import GradientDescentVisualizer from './components/GradientDescentVisualizer';
import BackpropagationFlow from './components/BackpropagationFlow';
import ActivationFunctionVisualizer from './components/ActivationFunctionVisualizer';

function App() {
  const [activeTab, setActiveTab] = useState('forward-prop');
  const [inputData, setInputData] = useState({
    temperatureChange: 0,
    precipitationChange: 0,
    co2Level: 400
  });
  
  const [networkState, setNetworkState] = useState({
    weights: {
      inputToHidden: [
        [0.5, -0.3, 0.4, 0.2],   // Better positive/negative balance
        [0.3, 0.6, -0.2, 0.4],   // Ensure some positive weights
        [-0.2, 0.4, 0.5, -0.3]   // Mixed signs for diversity
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
    
    // Normalize inputs - ensure they're not all zero or negative
    const normalizedInputs = [
      Math.max(0.1, (inputs.temperatureChange + 2) / 6), // 0.1 to 1.0 range
      Math.max(0.1, (inputs.precipitationChange + 30) / 60), // 0.1 to 1.0 range  
      Math.max(0.1, (inputs.co2Level - 350) / 450) // 0.1 to 1.0 range
    ];
    
    steps.push({
      type: 'input',
      description: 'Input Layer Activation',
      values: normalizedInputs,
      calculation: `Temperature: ${inputs.temperatureChange}°C → ${normalizedInputs[0].toFixed(3)}
Precipitation: ${inputs.precipitationChange}% → ${normalizedInputs[1].toFixed(3)}
CO2: ${inputs.co2Level}ppm → ${normalizedInputs[2].toFixed(3)}
(Normalized to 0.1-1.0 range for stable learning)`
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

  const tabs = [
    {
      id: 'forward-prop',
      label: '📊 Ch1-3: Forward Propagation',
      description: 'Basic neural network with forward propagation - the foundation concepts'
    },
    {
      id: 'gradient-descent',
      label: '⚡ Ch4: Gradient Descent',
      description: 'How networks learn through gradient descent and weight updates'
    },
    {
      id: 'backpropagation',
      label: '🔄 Ch6: Backpropagation',
      description: 'Error flow backward through multi-layer networks'
    },
    {
      id: 'activation-functions',
      label: '⚡ Ch5-6: Activation Functions',
      description: 'Nonlinear functions that enable complex pattern learning'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'forward-prop':
        return (
          <div className="tab-content forward-prop-content">
            <div className="chapter-header">
              <h2>🌱 Chapters 1-3: Neural Network Foundations</h2>
              <p>Experience the core concepts: neurons as mathematical functions, weighted connections, and forward propagation through a climate impact prediction network.</p>
            </div>
            
            <div className="main-content">
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
            </div>
          </div>
        );
        
      case 'gradient-descent':
        return (
          <div className="tab-content gradient-descent-content">
            <div className="chapter-header">
              <h2>📈 Chapter 4: Gradient Descent Learning</h2>
              <p>Watch how neural networks learn by adjusting weights to minimize prediction errors. Experience the "hot and cold" learning process and see gradient descent in action.</p>
            </div>
            
            <div className="gradient-content">
              <div className="input-section">
                <DataInputPanel 
                  inputData={inputData}
                  setInputData={setInputData}
                  onRunPropagation={() => {}} // No effect in this tab
                  isAnimating={false}
                />
              </div>
              
              <GradientDescentVisualizer 
                inputData={inputData}
              />
            </div>
          </div>
        );
        
      case 'backpropagation':
        return (
          <div className="tab-content backpropagation-content">
            <div className="chapter-header">
              <h2>🔄 Chapter 6: Backpropagation Deep Dive</h2>
              <p>Discover how neural networks learn by flowing error signals backward through the network. Watch the chain rule in action as gradients propagate layer by layer.</p>
            </div>
            
            <div className="backprop-content">
              <div className="input-section">
                <DataInputPanel 
                  inputData={inputData}
                  setInputData={setInputData}
                  onRunPropagation={() => {}} // No effect in this tab
                  isAnimating={false}
                />
              </div>
              
              <BackpropagationFlow 
                inputData={inputData}
              />
            </div>
          </div>
        );
        
      case 'activation-functions':
        return (
          <div className="tab-content activation-content">
            <div className="chapter-header">
              <h2>⚡ Chapters 5-6: Activation Functions</h2>
              <p>Explore the nonlinear functions that give neural networks their power. Compare ReLU, sigmoid, tanh, and leaky ReLU to understand when to use each.</p>
            </div>
            
            <ActivationFunctionVisualizer />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🧠 Neural Networks Visualizer</h1>
        <p>Interactive Learning Tool - Chapters 1-6 from Dr. Lee's Course</p>
        <div className="course-context">
          <p>🌍 <em>Applied to Climate Impact Prediction</em></p>
        </div>
      </header>
      
      <nav className="tabs-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className="tab-label">{tab.label}</div>
            <div className="tab-description">{tab.description}</div>
          </button>
        ))}
      </nav>
      
      <main className="app-main">
        {renderTabContent()}
      </main>
      
      <footer className="app-footer">
        <div className="learning-objectives">
          <h3>🎯 What You'll Learn</h3>
          <div className="objectives-grid">
            <div className="objective">
              <h4>Forward Propagation</h4>
              <p>How data flows through neural networks from input to output</p>
            </div>
            <div className="objective">
              <h4>Gradient Descent</h4>
              <p>The fundamental learning algorithm that adjusts weights to minimize error</p>
            </div>
            <div className="objective">
              <h4>Backpropagation</h4>
              <p>How error signals propagate backward to update all network weights</p>
            </div>
            <div className="objective">
              <h4>Activation Functions</h4>
              <p>Nonlinear functions that enable networks to learn complex patterns</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
