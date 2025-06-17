import React, { useState } from 'react';
import { DungeonMap } from '../DungeonMap';
import { MapTester, TestResult } from './MapTester';
import { MapValidator, ValidationResult } from '../validation/MapValidator';

interface MapTestUIProps {
  map: DungeonMap;
}

export const MapTestUI: React.FC<MapTestUIProps> = ({ map }) => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // 运行测试
  const runTests = () => {
    setIsRunning(true);
    const tester = new MapTester(map);
    const result = tester.runTests();
    setTestResult(result);
    setIsRunning(false);
  };

  // 运行验证
  const runValidation = () => {
    const validator = new MapValidator(map);
    const result = validator.validate();
    setValidationResult(result);
  };

  return (
    <div className="map-test-ui">
      <div className="toolbar">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="test-button"
        >
          {isRunning ? '测试中...' : '运行测试'}
        </button>
        <button
          onClick={runValidation}
          className="validate-button"
        >
          运行验证
        </button>
      </div>

      <div className="results">
        {testResult && (
          <div className="test-results">
            <h3>测试结果</h3>
            <div className="summary">
              <div className={`status ${testResult.passed ? 'passed' : 'failed'}`}>
                {testResult.passed ? '通过' : '失败'}
              </div>
              <div className="stats">
                <span>测试用例: {testResult.tests.length}</span>
                <span>错误: {testResult.errors.length}</span>
              </div>
            </div>

            <div className="test-cases">
              {testResult.tests.map((test, index) => (
                <div
                  key={index}
                  className={`test-case ${test.passed ? 'passed' : 'failed'}`}
                >
                  <div className="test-name">{test.name}</div>
                  {!test.passed && (
                    <div className="test-error">
                      <div className="error-message">{test.error}</div>
                      {test.details && (
                        <div className="error-details">
                          <pre>{JSON.stringify(test.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {testResult.errors.length > 0 && (
              <div className="errors">
                <h4>错误列表</h4>
                {testResult.errors.map((error, index) => (
                  <div key={index} className="error">
                    <div className="error-test">{error.testCase}</div>
                    <div className="error-message">{error.message}</div>
                    {error.details && (
                      <div className="error-details">
                        <pre>{JSON.stringify(error.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {validationResult && (
          <div className="validation-results">
            <h3>验证结果</h3>
            <div className="summary">
              <div className={`status ${validationResult.isValid ? 'passed' : 'failed'}`}>
                {validationResult.isValid ? '有效' : '无效'}
              </div>
              <div className="stats">
                <span>错误: {validationResult.errors.length}</span>
                <span>警告: {validationResult.warnings.length}</span>
              </div>
            </div>

            {validationResult.errors.length > 0 && (
              <div className="errors">
                <h4>错误列表</h4>
                {validationResult.errors.map((error, index) => (
                  <div key={index} className="error">
                    <div className="error-message">{error.message}</div>
                    {error.details && (
                      <div className="error-details">
                        <pre>{JSON.stringify(error.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {validationResult.warnings.length > 0 && (
              <div className="warnings">
                <h4>警告列表</h4>
                {validationResult.warnings.map((warning, index) => (
                  <div key={index} className="warning">
                    <div className="warning-message">{warning.message}</div>
                    {warning.details && (
                      <div className="warning-details">
                        <pre>{JSON.stringify(warning.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .map-test-ui {
          padding: 20px;
          background: #2a2a2a;
          color: #fff;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .toolbar {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .test-button,
        .validate-button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .test-button {
          background: #4CAF50;
          color: white;
        }

        .test-button:hover {
          background: #45a049;
        }

        .test-button:disabled {
          background: #666;
          cursor: not-allowed;
        }

        .validate-button {
          background: #2196F3;
          color: white;
        }

        .validate-button:hover {
          background: #1976D2;
        }

        .results {
          flex: 1;
          overflow-y: auto;
          display: flex;
          gap: 20px;
        }

        .test-results,
        .validation-results {
          flex: 1;
          background: #333;
          padding: 20px;
          border-radius: 4px;
        }

        .summary {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
        }

        .status.passed {
          background: #4CAF50;
        }

        .status.failed {
          background: #f44336;
        }

        .stats {
          display: flex;
          gap: 10px;
        }

        .test-cases {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .test-case {
          padding: 10px;
          border-radius: 4px;
          background: #444;
        }

        .test-case.passed {
          border-left: 4px solid #4CAF50;
        }

        .test-case.failed {
          border-left: 4px solid #f44336;
        }

        .test-name {
          font-weight: bold;
          margin-bottom: 5px;
        }

        .error-message {
          color: #f44336;
        }

        .error-details,
        .warning-details {
          margin-top: 5px;
          background: #222;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
        }

        .errors,
        .warnings {
          margin-top: 20px;
        }

        .error,
        .warning {
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .error {
          background: #f44336;
        }

        .warning {
          background: #ff9800;
        }

        .error-test,
        .error-message,
        .warning-message {
          font-weight: bold;
        }

        pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      `}</style>
    </div>
  );
}; 