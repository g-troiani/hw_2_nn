# 🌍 Climate Impact Predictor

## Neural Network Forward Propagation Visualizer

A React-based web application that demonstrates forward propagation in neural networks using environmental data to predict biodiversity impacts. This project was built as part of the Vibe Coding assignment for Dr. Lee's Neural Networks course.

## 🎯 Project Overview

This application visualizes how a neural network processes environmental inputs (temperature change, precipitation change, and CO2 levels) through forward propagation to predict biodiversity impact scores. The project demonstrates key concepts in neural network architecture and computation while addressing real-world environmental challenges.

## ✨ Features

### 🧠 Neural Network Visualization
- Interactive SVG-based network diagram showing 3-4-1 architecture
- Real-time visualization of node activations and connection weights
- Animated forward propagation with color-coded neurons
- Dynamic connection thickness based on weight magnitude and activations

### 🌡️ Environmental Input Controls
- Interactive sliders for three climate variables:
  - Temperature Change (-2°C to +4°C)
  - Precipitation Change (-30% to +30%)
  - CO2 Concentration (400-800 ppm)
- Preset scenario buttons (Current Trend, Mitigation, Worst Case, Optimistic)
- Real-time input validation and normalization

### 🔄 Step-by-Step Propagation
- Detailed calculation breakdown for each layer
- Mathematical formulas and intermediate values
- ReLU activation for hidden layer
- Sigmoid activation for output layer
- Progressive animation showing data flow

### 📊 Comprehensive Results
- Biodiversity impact score (0-100%)
- Color-coded impact levels (Very Low to Critical)
- Environmental factor contribution analysis
- Ecosystem-specific effects and recommendations
- Actionable insights based on predictions

## 🏗️ Architecture

### Neural Network Design
- **Input Layer**: 3 neurons (Temperature, Precipitation, CO2)
- **Hidden Layer**: 4 neurons with ReLU activation
- **Output Layer**: 1 neuron with Sigmoid activation
- **Weights**: Pre-defined for climate-biodiversity relationships

### Technology Stack
- **Frontend**: React 19.1.0
- **Styling**: Custom CSS with modern gradients and animations
- **Visualization**: Native SVG for network diagrams
- **State Management**: React Hooks (useState, useEffect)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd climate-impact-predictor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## 🧮 Forward Propagation Implementation

### Mathematical Operations

1. **Input Normalization**:
   - Temperature: `(value) / 4` (scale -2 to +4 → -0.5 to +1)
   - Precipitation: `(value) / 30` (scale -30% to +30% → -1 to +1)  
   - CO2: `(value - 400) / 400` (scale 400-800 → 0 to 1)

2. **Hidden Layer Calculation**:
   ```
   z_hidden = Σ(w_ij × x_i) for each hidden neuron j
   a_hidden = ReLU(z_hidden) = max(0, z_hidden)
   ```

3. **Output Layer Calculation**:
   ```
   z_output = Σ(w_jk × a_hidden_j)
   a_output = Sigmoid(z_output) = 1 / (1 + e^(-z_output))
   ```

### Predefined Weights

The network uses carefully chosen weights that model climate-biodiversity relationships:

**Input to Hidden Layer**:
```javascript
[
  [0.1, 0.2, -0.1, 0.15],    // Temperature weights
  [-0.15, 0.25, 0.1, -0.2],  // Precipitation weights  
  [0.05, -0.1, -0.15, 0.3]   // CO2 weights
]
```

**Hidden to Output Layer**:
```javascript
[[0.4], [0.3], [-0.5], [0.2]]
```

## 🎨 User Interface Components

### DataInputPanel
- Environmental parameter controls
- Preset scenario buttons
- Real-time value display
- Input validation and constraints

### NeuralNetworkVisualization  
- SVG-based network diagram
- Animated connections and nodes
- Weight visualization on hover
- Color-coded activations

### PropagationSteps
- Step-by-step calculation breakdown
- Mathematical operation explanations
- Progress indicators
- Activation function details

### ResultsPanel
- Impact score visualization
- Environmental factor analysis
- Ecosystem effects breakdown
- Actionable recommendations

## 🌍 Environmental Scenarios

### Preset Scenarios
1. **Current Trend**: Moderate warming (+1.5°C, -5% precipitation, 420 ppm CO2)
2. **Mitigation**: Successful intervention (+1.0°C, 0% precipitation, 450 ppm CO2)  
3. **Worst Case**: Severe impact (+3.5°C, -20% precipitation, 700 ppm CO2)
4. **Optimistic**: Best outcome (+0.5°C, +5% precipitation, 380 ppm CO2)

### Impact Interpretation
- **0-20%**: Very Low Impact (Green) - Favorable conditions
- **20-40%**: Low Impact (Yellow) - Manageable effects
- **40-60%**: Moderate Impact (Orange) - Concerning changes
- **60-80%**: High Impact (Red) - Severe consequences  
- **80-100%**: Critical Impact (Dark Red) - Emergency action needed

## 📱 Responsive Design

The application is fully responsive and works across:
- Desktop computers (1200px+)
- Tablets (768px-1199px)
- Mobile phones (320px-767px)

## 🔧 Customization

### Adding New Scenarios
To add new preset scenarios, modify the `presets` object in `DataInputPanel.js`:

```javascript
const presets = {
  newScenario: {
    temperatureChange: 2.0,
    precipitationChange: -10,
    co2Level: 500,
    description: "Your custom scenario description"
  }
};
```

### Modifying Network Architecture
To change the neural network structure, update the weights in `App.js` and adjust the visualization accordingly in `NeuralNetworkVisualization.js`.

## 🧪 Future Enhancements

- Real environmental data integration
- Multiple hidden layers support
- Interactive weight adjustment
- Model training visualization
- Additional activation functions
- Export functionality for results

## 📚 Educational Value

This project demonstrates:
- Forward propagation mechanics
- Activation function behavior
- Weight-input relationships
- Real-world AI applications
- Environmental data modeling
- Interactive learning design

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for improvements.

## 📄 License

This project is created for educational purposes as part of Dr. Lee's Neural Networks course.

## 🙏 Acknowledgments

- Dr. Ernesto Lee for the Vibe Coding assignment concept
- The React community for excellent documentation
- Environmental scientists for climate-biodiversity research insights

---

*Built with ❤️ using Vibe Coding principles and AI-assisted development*
