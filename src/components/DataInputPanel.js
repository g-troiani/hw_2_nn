import React from 'react';
import './DataInputPanel.css';

const DataInputPanel = ({ inputData, setInputData, onRunPropagation, isAnimating }) => {
  const handleInputChange = (field, value) => {
    setInputData(prev => ({
      ...prev,
      [field]: parseFloat(value)
    }));
  };

  const loadPresetScenario = (scenario) => {
    const presets = {
      currentTrend: {
        temperatureChange: 1.5,
        precipitationChange: -5,
        co2Level: 420,
        description: "Current climate trend with moderate warming"
      },
      mitigation: {
        temperatureChange: 1.0,
        precipitationChange: 0,
        co2Level: 450,
        description: "Successful climate mitigation scenario"
      },
      worstCase: {
        temperatureChange: 3.5,
        precipitationChange: -20,
        co2Level: 700,
        description: "Worst-case climate scenario"
      },
      optimistic: {
        temperatureChange: 0.5,
        precipitationChange: 5,
        co2Level: 380,
        description: "Optimistic scenario with cooling and increased precipitation"
      }
    };

    if (presets[scenario]) {
      setInputData(prev => ({
        ...prev,
        ...presets[scenario]
      }));
    }
  };

  const resetToDefaults = () => {
    setInputData({
      temperatureChange: 0,
      precipitationChange: 0,
      co2Level: 400
    });
  };

  return (
    <div className="data-input-panel">
      <h3>🌡️ Environmental Input Parameters</h3>
      
      <div className="input-section">
        <div className="input-group">
          <label htmlFor="temperature">
            Temperature Change (°C)
            <span className="range-info">(-2°C to +4°C)</span>
          </label>
          <input
            id="temperature"
            type="range"
            min="-2"
            max="4"
            step="0.1"
            value={inputData.temperatureChange}
            onChange={(e) => handleInputChange('temperatureChange', e.target.value)}
            className="slider temperature-slider"
            disabled={isAnimating}
          />
          <div className="input-value">
            <input
              type="number"
              min="-2"
              max="4"
              step="0.1"
              value={inputData.temperatureChange}
              onChange={(e) => handleInputChange('temperatureChange', e.target.value)}
              className="number-input"
              disabled={isAnimating}
            />
            <span className="unit">°C</span>
          </div>
          <div className="input-description">
            Change in global average temperature from baseline
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="precipitation">
            Precipitation Change (%)
            <span className="range-info">(-30% to +30%)</span>
          </label>
          <input
            id="precipitation"
            type="range"
            min="-30"
            max="30"
            step="1"
            value={inputData.precipitationChange}
            onChange={(e) => handleInputChange('precipitationChange', e.target.value)}
            className="slider precipitation-slider"
            disabled={isAnimating}
          />
          <div className="input-value">
            <input
              type="number"
              min="-30"
              max="30"
              step="1"
              value={inputData.precipitationChange}
              onChange={(e) => handleInputChange('precipitationChange', e.target.value)}
              className="number-input"
              disabled={isAnimating}
            />
            <span className="unit">%</span>
          </div>
          <div className="input-description">
            Change in average precipitation patterns
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="co2">
            CO2 Concentration (ppm)
            <span className="range-info">(400ppm to 800ppm)</span>
          </label>
          <input
            id="co2"
            type="range"
            min="400"
            max="800"
            step="10"
            value={inputData.co2Level}
            onChange={(e) => handleInputChange('co2Level', e.target.value)}
            className="slider co2-slider"
            disabled={isAnimating}
          />
          <div className="input-value">
            <input
              type="number"
              min="400"
              max="800"
              step="10"
              value={inputData.co2Level}
              onChange={(e) => handleInputChange('co2Level', e.target.value)}
              className="number-input"
              disabled={isAnimating}
            />
            <span className="unit">ppm</span>
          </div>
          <div className="input-description">
            Atmospheric CO2 concentration
          </div>
        </div>
      </div>

      <div className="preset-scenarios">
        <h4>📋 Preset Scenarios</h4>
        <div className="scenario-buttons">
          <button
            onClick={() => loadPresetScenario('currentTrend')}
            className="scenario-btn current-trend"
            disabled={isAnimating}
            title="Current climate trend with moderate warming"
          >
            Current Trend
          </button>
          <button
            onClick={() => loadPresetScenario('mitigation')}
            className="scenario-btn mitigation"
            disabled={isAnimating}
            title="Successful climate mitigation scenario"
          >
            Mitigation
          </button>
          <button
            onClick={() => loadPresetScenario('worstCase')}
            className="scenario-btn worst-case"
            disabled={isAnimating}
            title="Worst-case climate scenario"
          >
            Worst Case
          </button>
          <button
            onClick={() => loadPresetScenario('optimistic')}
            className="scenario-btn optimistic"
            disabled={isAnimating}
            title="Optimistic scenario with cooling"
          >
            Optimistic
          </button>
        </div>
      </div>

      <div className="action-buttons">
        <button
          onClick={onRunPropagation}
          className="run-simulation-btn"
          disabled={isAnimating}
        >
          {isAnimating ? (
            <>
              <span className="spinner"></span>
              Running Simulation...
            </>
          ) : (
            <>
              🚀 Run Forward Propagation
            </>
          )}
        </button>
        
        <button
          onClick={resetToDefaults}
          className="reset-btn"
          disabled={isAnimating}
        >
          🔄 Reset to Defaults
        </button>
      </div>

      <div className="current-values">
        <h4>📊 Current Input Values</h4>
        <div className="values-grid">
          <div className="value-item">
            <span className="value-label">Temperature:</span>
            <span className="value-number">{inputData.temperatureChange.toFixed(1)}°C</span>
          </div>
          <div className="value-item">
            <span className="value-label">Precipitation:</span>
            <span className="value-number">{inputData.precipitationChange.toFixed(0)}%</span>
          </div>
          <div className="value-item">
            <span className="value-label">CO2:</span>
            <span className="value-number">{inputData.co2Level.toFixed(0)} ppm</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataInputPanel; 