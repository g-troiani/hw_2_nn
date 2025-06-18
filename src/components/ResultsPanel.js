import React from 'react';
import './ResultsPanel.css';

const ResultsPanel = ({ outputValue, inputData }) => {
  const biodiversityScore = outputValue * 100;
  
  const getImpactLevel = (score) => {
    if (score < 20) return { level: 'Very Low', color: '#4CAF50', icon: '🟢' };
    if (score < 40) return { level: 'Low', color: '#8BC34A', icon: '🟡' };
    if (score < 60) return { level: 'Moderate', color: '#FF9800', icon: '🟠' };
    if (score < 80) return { level: 'High', color: '#FF5722', icon: '🔴' };
    return { level: 'Critical', color: '#B71C1C', icon: '🚨' };
  };

  const impact = getImpactLevel(biodiversityScore);

  const getRecommendations = (score, inputs) => {
    const recommendations = [];
    
    if (score > 60) {
      recommendations.push("🚨 Immediate action required to mitigate biodiversity loss");
      recommendations.push("🌡️ Implement aggressive temperature reduction strategies");
    }
    
    if (inputs.temperatureChange > 2) {
      recommendations.push("❄️ Focus on carbon emission reduction programs");
      recommendations.push("🌳 Increase forest conservation and reforestation efforts");
    }
    
    if (inputs.precipitationChange < -10) {
      recommendations.push("💧 Develop water conservation and management strategies");
      recommendations.push("🌾 Support drought-resistant ecosystem preservation");
    }
    
    if (inputs.co2Level > 500) {
      recommendations.push("🏭 Accelerate transition to renewable energy sources");
      recommendations.push("🌱 Enhance carbon capture and storage initiatives");
    }
    
    if (score < 30) {
      recommendations.push("✅ Current trajectory is favorable for biodiversity");
      recommendations.push("📈 Continue monitoring and maintaining current policies");
    }
    
    return recommendations;
  };

  const getEcosystemEffects = (score, inputs) => {
    const effects = [];
    
    if (inputs.temperatureChange > 1.5) {
      effects.push({
        ecosystem: "🏔️ Mountain Ecosystems",
        impact: "Habitat shift upward, species migration stress",
        severity: inputs.temperatureChange > 3 ? "severe" : "moderate"
      });
    }
    
    if (inputs.precipitationChange < -15) {
      effects.push({
        ecosystem: "🌊 Freshwater Systems",
        impact: "Reduced water levels, aquatic habitat loss",
        severity: inputs.precipitationChange < -20 ? "severe" : "moderate"
      });
    }
    
    if (inputs.co2Level > 450) {
      effects.push({
        ecosystem: "🌊 Marine Ecosystems",
        impact: "Ocean acidification, coral bleaching",
        severity: inputs.co2Level > 600 ? "severe" : "moderate"
      });
    }
    
    if (score > 50) {
      effects.push({
        ecosystem: "🌲 Forest Ecosystems",
        impact: "Increased wildfire risk, pest outbreaks",
        severity: score > 70 ? "severe" : "moderate"
      });
    }
    
    return effects;
  };

  const recommendations = getRecommendations(biodiversityScore, inputData);
  const ecosystemEffects = getEcosystemEffects(biodiversityScore, inputData);

  return (
    <div className="results-panel">
      <h3>📊 Prediction Results</h3>
      
      <div className="main-result">
        <div className="score-display">
          <div className="score-circle" style={{ borderColor: impact.color }}>
            <span className="score-number" style={{ color: impact.color }}>
              {biodiversityScore.toFixed(1)}%
            </span>
            <span className="score-label">Impact Score</span>
          </div>
          
          <div className="impact-level">
            <span className="impact-icon">{impact.icon}</span>
            <span className="impact-text" style={{ color: impact.color }}>
              {impact.level} Impact
            </span>
          </div>
        </div>
        
        <div className="result-interpretation">
          <h4>🔍 Interpretation</h4>
          <p>
            Based on the environmental parameters, the neural network predicts a{' '}
            <strong style={{ color: impact.color }}>{impact.level.toLowerCase()}</strong>{' '}
            impact on biodiversity. This score represents the predicted negative effects 
            on ecosystem health and species diversity.
          </p>
        </div>
      </div>

      <div className="environmental-breakdown">
        <h4>🌍 Environmental Factor Contributions</h4>
        <div className="factor-analysis">
          <div className="factor-item">
            <span className="factor-icon">🌡️</span>
            <div className="factor-details">
              <span className="factor-name">Temperature Change</span>
              <span className="factor-value">{inputData.temperatureChange.toFixed(1)}°C</span>
              <div className="factor-bar">
                <div 
                  className="factor-fill temperature"
                  style={{ width: `${Math.min(100, Math.abs(inputData.temperatureChange) / 4 * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="factor-item">
            <span className="factor-icon">🌧️</span>
            <div className="factor-details">
              <span className="factor-name">Precipitation Change</span>
              <span className="factor-value">{inputData.precipitationChange.toFixed(0)}%</span>
              <div className="factor-bar">
                <div 
                  className="factor-fill precipitation"
                  style={{ width: `${Math.min(100, Math.abs(inputData.precipitationChange) / 30 * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="factor-item">
            <span className="factor-icon">💨</span>
            <div className="factor-details">
              <span className="factor-name">CO2 Concentration</span>
              <span className="factor-value">{inputData.co2Level.toFixed(0)} ppm</span>
              <div className="factor-bar">
                <div 
                  className="factor-fill co2"
                  style={{ width: `${Math.min(100, (inputData.co2Level - 400) / 400 * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {ecosystemEffects.length > 0 && (
        <div className="ecosystem-effects">
          <h4>🌿 Ecosystem Effects</h4>
          <div className="effects-list">
            {ecosystemEffects.map((effect, index) => (
              <div key={index} className={`effect-item ${effect.severity}`}>
                <span className="ecosystem-name">{effect.ecosystem}</span>
                <p className="effect-description">{effect.impact}</p>
                <span className={`severity-badge ${effect.severity}`}>
                  {effect.severity} impact
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="recommendations">
          <h4>💡 Recommendations</h4>
          <ul className="recommendations-list">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="recommendation-item">
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="confidence-info">
        <h4>📈 Model Information</h4>
        <div className="model-details">
          <div className="detail-item">
            <span className="detail-label">Architecture:</span>
            <span className="detail-value">3-4-1 Feedforward Network</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Activation Functions:</span>
            <span className="detail-value">ReLU (Hidden), Sigmoid (Output)</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Output Range:</span>
            <span className="detail-value">0% (No Impact) to 100% (Maximum Impact)</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Training Focus:</span>
            <span className="detail-value">Climate-Biodiversity Relationships</span>
          </div>
        </div>
      </div>

      <div className="action-call">
        <div className="call-to-action">
          <h4>🎯 Take Action</h4>
          <p>
            Understanding the relationship between climate variables and biodiversity 
            impact is the first step toward effective conservation strategies. 
            Use these predictions to guide policy decisions and environmental planning.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel; 