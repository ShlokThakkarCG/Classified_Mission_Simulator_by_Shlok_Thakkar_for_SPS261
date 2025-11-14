ISP Project: Classified Mission Simulator (CMS)

Author: [Shlok Thakkar]
Course: Government Secrecy and Intelligence Studies (SPS 261)
Date: November 14, 2025

1.  Live Simulation & Repository

Live Project Website: [https://shlokthakkarcg.github.io/Classified_Mission_Simulator_by_Shlok_Thakkar_for_SPS261/index.html]

GitHub Repository: [https://github.com/ShlokThakkarCG/Classified_Mission_Simulator_by_Shlok_Thakkar_for_SPS261]

2. Summary

The Classified Mission Simulator (CMS) is a static web application designed for a university project on Government Secrecy and Space Militarization. It is an interactive, browser-based educational tool that models the high-stakes trade-offs at the heart of modern space policy. The user plays the role of a government director managing a classified space program, making a series of 10 decisions that directly impact four key metrics: Public Trust, System Resilience, Diplomatic Stability, and Budget.

Grounded in foundational academic research on dual-use technology and game theory, the simulation moves beyond static case studies to provide a dynamic, playable model of policy consequences. The project is built entirely with front-end technologies (HTML, CSS, JavaScript) and runs in any modern browser, with all mission data and user progress handled dynamically.

3. Project Showcase & User Flow

Start: The user begins at index.html and clicks "Begin Mission."

![Landing Page](https://shlokthakkarcg.github.io/Classified_Mission_Simulator_by_Shlok_Thakkar_for_SPS261/index.html)

Role Selection: On role-select.html, the user chooses one of four mandates (e.g., "Tech Giant," "Militarized State"), which sets their starting metrics.

![Role Selection](https://shlokthakkarcg.github.io/Classified_Mission_Simulator_by_Shlok_Thakkar_for_SPS261/role-select.html)

Dashboard: The user lands on dashboard.html. app.js loads their state and fetches the first mission from missions.json.

![Main Dashboard](https://shlokthakkarcg.github.io/Classified_Mission_Simulator_by_Shlok_Thakkar_for_SPS261/dashboard.html)

Mission Loop:

The user reads the scenario and selects a decision button.

makeDecision() processes the choice, calculates the consequences, and updates the gameState.

showAnalysis() takes over the UI, displaying an animated breakdown of the metric changes and a "Next Mission" button at the top of the panel.

The user clicks "Next Mission," and loadScenario() loads the next mission from the JSON.

This loop repeats 10 times.

Game End: After the 10th mission, app.js saves the final state and redirects the user to end.html.

Final Debrief: end.html reads the final state, calculates an average score, and displays one of three text-based outcomes (Balanced Success, Instability Warning, or Complete Disaster). It also renders the final, animated Chart.js graph summarizing their performance.

Screenshot Placeholder: Add a screenshot of the end.html screen with the chart.
![End Screen](https://shlokthakkarcg.github.io/Classified_Mission_Simulator_by_Shlok_Thakkar_for_SPS261/end.html)

Restart: The user can click "Restart Simulation," which clears localStorage and sends them back to index.html.

4. Academic & Theoretical Foundation

The simulation is not an arbitrary game; its design is a direct translation of the project's core academic research into an interactive system. The logic is built by synthesizing two key works:

1. Vaynman & Volpe (2023), "Dual Use Deception: How Technology Shapes Cooperation in International Relations"

DOI: https://doi.org/10.1017/S0020818323000140

Concept: This paper provides the problem of the simulation. It argues that modern tech (like space, AI, and cyber) exists in a "dead zone" of cooperation because it is both indistinguishable (civilian and military uses are hard to tell apart) and highly integrated (embedded in all sectors of society).

Application: The missions (e.g., "The Argus-1 Launch," "Allied Tech Request") are built around this "dead zone," forcing the player to choose between deception and transparency for a dual-use satellite.

2. Zagare (2019), "Game Theory, Diplomatic History and Security Studies"

DOI: https://doi.org/10.1093/oso/9780198831587.001.0001

Concept: This book provides the mechanic of the simulation. It argues that game theory (like the "Game of Chicken" or "Asymmetric Escalation") provides a rigorous model for understanding historical crises.

Application: Each mission is a "game" in the formal sense. The player's decisions are "moves" that have a "payoff." In this simulation, the payoffs are the changes to the four key metrics.

The Four Metrics (The "Payoff" Structure)

Based on this framework, every decision is a trade-off between competing priorities, which are quantified as the four core metrics:

Public Trust: Represents the media's and public's confidence in your program.

System Resilience: The technical and operational integrity of your space assets (i.e., your ability to defend secrets and neutralize threats).

Diplomatic Stability: The state of relations with allies and rivals.

Budget: Your program's finite financial resources.

5. Alignment with Course Objectives (SPS 261 Rubric)

This project was designed to meet the evaluation criteria for the Independent Study Project by demonstrating the following competencies:

Initiative: The project represents a proactive and high-impact "creative work," as described in the rubric. Instead of a standard research paper, this simulation was built from the ground up, requiring spontaneous problem-solving and volunteering for the complex challenge of translating dense academic theory into a functional, interactive application.

Results Orientation: The final 8-file application is the "best-in-class performance" for this concept. It delivers a complete, multi-page web application with a branching narrative, persistent state, and dynamic UI—a "measurably better result" than a static paper for demonstrating the consequences of policy.

Communication, Professional Impression & Poise: The entire project is an exercise in professional communication. The about.html methodology page, this README.md, and the final LaTeX report "logically structure content for a broad audience." The clean, consistent, and "command center" themed UI is designed to leave a "positive and professional impression" on the user.

Self-Awareness: The project's design required a constant process of self-awareness. The logic was iterated upon by "actively seeking out feedback" from the foundational academic papers, "exploring reasons for problems openly" (e.g., "Why is this scenario not working?"), and adjusting the game mechanics to more accurately reflect the core concepts.

Problem Solving: This project is a direct solution to a "complex, interconnected problem." The "problem" was: How to model the trade-offs between secrecy, trust, diplomacy, and budget? The "solution" is the simulation itself, which "integrates perspectives from a variety of sources" (the papers) to create a practical model that "solves tough and interconnected problems" by showing how the four metrics are connected.

Strategic Orientation: The entire simulation is a "strategic orientation" tool. It "develops insights" by forcing the user to think about the "long-term cost-benefit performance" of their decisions. The "About" page, in particular, demonstrates that the project was built with a deep understanding of the "implications of work" and how each mission shapes "long-term strategy" within the game's world.

6. 🙏 Acknowledgements

I would like to extend my sincere gratitude to my professor, Keita Omi, for his invaluable guidance, critical perspectives, and the academic freedom to pursue this creative project.

I would also like to thank my teaching assistant, Ananya Singh, for her consistent support, feedback, and encouragement throughout the semester.
