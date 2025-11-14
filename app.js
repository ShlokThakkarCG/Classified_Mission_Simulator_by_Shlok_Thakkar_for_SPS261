/*
 * Classified Mission Simulator - app.js
 * This file handles all game logic, state management, and UI updates for the dashboard.
 */

// Wait for the DOM to be fully loaded before initializing the game
document.addEventListener('DOMContentLoaded', () => {

    // ===== STATE VARIABLES =====
    let gameState = {}; // Holds the player's current metrics and mission number
    let allScenarios = {}; // Holds all mission data loaded from missions.json
    const MAX_MISSIONS = 10;

    // ===== DOM ELEMENT REFERENCES =====
    // Get all necessary elements from the DOM at startup
    const elements = {
        roleNameEl: document.getElementById('player-role'),
        missionNumberEl: document.getElementById('mission-number'),
        systemStatusText: document.getElementById('system-status-text'),
        systemStatusLight: document.getElementById('system-status-light'),
        decisionPanel: document.getElementById('decision-panel'),
        decisionTitle: document.getElementById('decision-title'),
        decisionDescription: document.getElementById('decision-description'),
        decisionOptions: document.getElementById('decision-options'),
        metrics: {
            publicTrust: {
                bar: document.getElementById('public-trust-bar'),
                value: document.getElementById('public-trust-value')
            },
            systemResilience: {
                bar: document.getElementById('system-resilience-bar'),
                value: document.getElementById('system-resilience-value')
            },
            diplomaticStability: {
                bar: document.getElementById('diplomatic-stability-bar'),
                value: document.getElementById('diplomatic-stability-value')
            },
            budget: {
                bar: document.getElementById('budget-bar'),
                value: document.getElementById('budget-value')
            }
        }
    };

    // ===== CORE FUNCTIONS =====

    /**
     * Initializes the game.
     * Fetches mission data, loads game state from localStorage, and loads the first scenario.
     */
    async function initGame() {
        // 1. Fetch mission data from JSON
        try {
            const response = await fetch('missions.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allScenarios = await response.json();
        } catch (error) {
            console.error("Fatal Error: Could not load missions.json.", error);
            elements.decisionTitle.textContent = "Error: Mission Data Missing";
            elements.decisionDescription.textContent = "Could not load scenarios. Please check the console and ensure 'missions.json' is accessible.";
            return;
        }

        // 2. Load game state from localStorage
        const savedState = localStorage.getItem('cmsGameState');
        if (savedState) {
            gameState = JSON.parse(savedState);
        } else {
            // This is a fallback, but the user *should* come from role-select.html
            // If they land here directly, redirect them to the start
            window.location.href = 'index.html';
            return;
        }
        
        // 3. Load the first or current scenario
        // 'currentScenario' key is added to gameState after the first decision
        const scenarioToLoad = gameState.currentScenario || 'START';
        loadScenario(scenarioToLoad);
        updateUI();
    }

    /**
     * Loads a specific scenario by its ID.
     * @param {string} scenarioId - The key of the scenario to load from allScenarios.
     */
    function loadScenario(scenarioId) {
        // --- FIX for "stuck" bug ---
        // Check for end-game conditions *before* trying to load the scenario.
        if (scenarioId.toUpperCase() === 'END' || gameState.missionNumber > MAX_MISSIONS) {
            endSimulation();
            return;
        }

        // Remove the 'Next Mission' button from the previous step, if it exists
        const existingNextBtn = document.getElementById('next-mission-btn');
        if (existingNextBtn) {
            existingNextBtn.remove();
        }

        const scenario = allScenarios[scenarioId];
        if (!scenario) {
            console.error(`Error: Scenario ID "${scenarioId}" not found.`);
            elements.decisionTitle.textContent = "Error: Scenario Not Found";
            return;
        }

        // Update the main decision panel
        elements.decisionTitle.textContent = scenario.title;
        elements.decisionDescription.textContent = scenario.description;
        elements.decisionOptions.innerHTML = ''; // Clear old options

        // Create and display new decision buttons
        scenario.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'decision-button'; // Style from styles.css
            button.textContent = option.text;

            // Add budget check
            if (option.consequences.budget) {
                const futureBudget = (gameState.budget || 0) + option.consequences.budget;
                if (futureBudget < 0) {
                    button.textContent += ` (Insufficient Funds: ${option.consequences.budget}B)`;
                    button.disabled = true;
                }
            }
            
            button.onclick = () => makeDecision(option);
            elements.decisionOptions.appendChild(button);
        });
    }

    /**
     * Processes a user's decision, updates the game state, and shows the analysis.
     * @param {object} option - The chosen decision option object.
     */
    function makeDecision(option) {
        const consequences = option.consequences;
        let analysisItems = []; // To store feedback for the debrief screen

        // Disable all buttons to prevent double-clicks
        elements.decisionOptions.querySelectorAll('button').forEach(btn => btn.disabled = true);

        // 1. Apply consequences to game state
        if (consequences.publicTrust) {
            const oldVal = gameState.publicTrust;
            gameState.publicTrust = clamp(oldVal + consequences.publicTrust, 0, 100);
            analysisItems.push({ label: 'Public Trust', value: consequences.publicTrust, old: oldVal, new: gameState.publicTrust });
        }
        if (consequences.systemResilience) {
            const oldVal = gameState.systemResilience;
            gameState.systemResilience = clamp(oldVal + consequences.systemResilience, 0, 100);
            analysisItems.push({ label: 'System Resilience', value: consequences.systemResilience, old: oldVal, new: gameState.systemResilience });
        }
        if (consequences.diplomaticStability) {
            const oldVal = gameState.diplomaticStability;
            gameState.diplomaticStability = clamp(oldVal + consequences.diplomaticStability, 0, 100);
            analysisItems.push({ label: 'Diplomatic Stability', value: consequences.diplomaticStability, old: oldVal, new: gameState.diplomaticStability });
        }
        if (consequences.budget) {
            const oldVal = gameState.budget;
            gameState.budget += consequences.budget; // Budget can go negative (debt) but is clamped at 0 for some checks
            analysisItems.push({ label: 'Budget', value: consequences.budget, old: oldVal, new: gameState.budget, isBudget: true });
        }

        // --- FIX for "Mission 11" bug ---
        // We determine the *next* scenario *before* incrementing the mission number.
        const nextScenarioId = option.nextScenario;
        
        // 2. Update mission number and next scenario
        gameState.missionNumber++;
        gameState.currentScenario = nextScenarioId;

        // 3. Save the new state
        localStorage.setItem('cmsGameState', JSON.stringify(gameState));
        
        // 4. Update the UI metrics immediately
        updateUI();

        // 5. Show the analysis screen
        // Pass the *next* scenario ID so the button knows if it's the end
        showAnalysis(option.feedback, analysisItems, nextScenarioId);
    }

    /**
     * Displays the post-decision analysis and the "Next Mission" button.
     * @param {string} feedback - The narrative feedback text from the decision.
     * @param {Array<object>} analysisItems - The list of metric changes.
     * @param {string} nextScenarioId - The ID of the *next* scenario.
     */
    function showAnalysis(feedback, analysisItems, nextScenarioId) {
        // Change title to "Debrief"
        elements.decisionTitle.textContent = "Decision Debrief";
        
        // Display narrative feedback
        elements.decisionDescription.textContent = feedback;
        
        // Clear old decision buttons
        elements.decisionOptions.innerHTML = '';

        // --- Create the "Next Mission" Button and add it to the top ---
        const nextButton = document.createElement('button');
        nextButton.id = 'next-mission-btn'; // Give it an ID to be removed later
        
        // Check if this is the last mission
        if (nextScenarioId.toUpperCase() === 'END' || gameState.missionNumber > MAX_MISSIONS) {
            nextButton.className = 'decision-button bg-green-700/50 hover:bg-green-600/70 mb-6';
            nextButton.textContent = 'Proceed to Final Debrief →';
            nextButton.onclick = () => endSimulation();
        } else {
            nextButton.className = 'decision-button bg-blue-700/50 hover:bg-blue-600/70 mb-6'; // Standard blue
            nextButton.textContent = `Proceed to Mission ${gameState.missionNumber} →`;
            nextButton.onclick = () => loadScenario(nextScenarioId);
        }
        
        // Prepend the button to the decision-panel, *above* the title
        elements.decisionPanel.prepend(nextButton);

        // --- Create the animated analysis cards ---
        const analysisContainer = document.createElement('div');
        analysisContainer.className = 'analysis-container'; // From styles.css

        let animationDelay = 0;
        analysisItems.forEach(item => {
            const isNegative = item.value < 0;
            let isBudget = item.isBudget || false; // Ensure isBudget is defined
            const valueText = isBudget ? `${item.value}B` : `${item.value > 0 ? '+' : ''}${item.value}%`;
            
            let colorClass = isNegative ? 'text-red-400' : 'text-green-400';
            if (isBudget) {
                colorClass = isNegative ? 'text-red-400' : 'text-cyan-400';
            }

            const card = document.createElement('div');
            card.className = 'analysis-metric-card'; // From styles.css
            card.style.animationDelay = `${animationDelay}ms`; // Stagger animation
            animationDelay += 100; // 100ms delay between cards

            card.innerHTML = `
                <div class="flex-grow">
                    <div class="text-sm text-gray-400">${item.label}</div>
                    <div class="text-lg font-mono text-gray-300">${item.old}${isBudget ? 'B' : '%'} → ${item.new}${isBudget ? 'B' : '%'}</div>
                </div>
                <div class="text-2xl font-bold ${colorClass}">${valueText}</div>
            `;
            analysisContainer.appendChild(card);
        });

        // Add the container of cards to the screen
        elements.decisionOptions.appendChild(analysisContainer);
    }

    /**
     * Updates all metric bars and text displays based on the current gameState.
     */
    function updateUI() {
        if (!gameState) return;

        // Top Bar
        elements.roleNameEl.textContent = gameState.role;
        // FIX: Only set the number, not the surrounding text
        elements.missionNumberEl.textContent = gameState.missionNumber > MAX_MISSIONS ? MAX_MISSIONS : gameState.missionNumber; 

        // Update each metric
        updateBar('publicTrust', gameState.publicTrust);
        updateBar('systemResilience', gameState.systemResilience);
        updateBar('diplomaticStability', gameState.diplomaticStability);
        updateBar('budget', gameState.budget, 100, true); // Special case for budget

        // System Status
        const { trust, resilience, diplomacy, budget } = {
            trust: gameState.publicTrust,
            resilience: gameState.systemResilience,
            diplomacy: gameState.diplomaticStability,
            budget: gameState.budget
        };
        
        let statusText = 'NOMINAL';
        let statusClass = 'status-success';
        let statusTextColor = 'text-green-400';

        if (trust < 40 || resilience < 40 || diplomacy < 40 || budget < 30) {
            statusText = 'INSTABILITY WARNING';
            statusClass = 'status-warning';
            statusTextColor = 'text-yellow-400';
        }
        
        if (trust < 15 || resilience < 15 || diplomacy < 15 || budget <= 0) {
            statusText = 'COMPLETE DISASTER';
            statusClass = 'status-disaster';
            statusTextColor = 'text-red-400';
        }

        elements.systemStatusText.textContent = statusText;
        elements.systemStatusText.className = `${statusTextColor} font-medium`;
        elements.systemStatusLight.className = `status-light ${statusClass} w-3 h-3 rounded-full mr-2`;
    }

    /**
     * Helper function to update a single metric bar and its value text.
     * @param {string} metricName - The key of the metric (e.g., 'publicTrust').
     * @param {number} value - The new numeric value.
     * @param {number} [max=100] - The max value for calculating percentage.
     * @param {boolean} [isBudget=false] - Flag for special budget styling.
     */
    function updateBar(metricName, value, max = 100, isBudget = false) {
        const el = elements.metrics[metricName];
        if (!el) return;

        let displayValue = value;
        let displayPercent = (value / max) * 100;
        
        // Clamp values for display
        displayPercent = clamp(displayPercent, 0, 100);
        if (!isBudget) {
            displayValue = clamp(value, 0, 100);
        }

        // Get colors
        const { barColor, textColor } = getBarColor(displayValue, isBudget);

        // Update Bar
        el.bar.style.width = `${displayPercent}%`;
        el.bar.className = `progress-bar ${barColor}`; // Set color class

        // Update Text
        el.value.textContent = isBudget ? `$${displayValue}B` : `${displayValue}%`;
        el.value.className = `font-mono text-2xl font-bold ${textColor}`; // Set color class
    }

    /**
     * Helper function to get the correct color classes for a metric value.
     * @param {number} value - The numeric value.
     * @param {boolean} [isBudget=false] - Flag for special budget styling.
     * @returns {object} {barColor, textColor}
     */
    function getBarColor(value, isBudget = false) {
        if (isBudget) {
            let barColor = 'bg-cyan-500';
            let textColor = 'text-cyan-400';
            if (value < 50) {
                barColor = 'bg-yellow-500';
                textColor = 'text-yellow-400';
            }
            if (value < 20) {
                barColor = 'bg-red-500';
                textColor = 'text-red-400';
            }
            return { barColor, textColor };
        }

        // Default for percentage metrics
        if (value >= 70) return { barColor: 'bg-green-500', textColor: 'text-green-400' };
        if (value >= 40) return { barColor: 'bg-yellow-500', textColor: 'text-yellow-400' };
        return { barColor: 'bg-red-500', textColor: 'text-red-400' };
    }

    /**
     * Helper function to clamp a number between min and max.
     * @param {number} value - The number to clamp.
     * @param {number} min - The minimum allowed value.
     * @param {number} max - The maximum allowed value.
     * @returns {number}
     */
    function clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }

    /**
     * Ends the simulation, saves the final state, and redirects to the end screen.
     */
    function endSimulation() {
        // Save final state for the end screen to read
        localStorage.setItem('cmsFinalState', JSON.stringify(gameState));
        
        // Clear the mission state so a new game can start
        localStorage.removeItem('cmsGameState');
        localStorage.removeItem('cmsCurrentScenario'); // Ensure this is cleared too

        // Redirect to the end screen
        window.location.href = 'end.html';
    }

    // --- Start the game ---
    initGame();
});