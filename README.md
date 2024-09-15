## Problem Statement

Mathematicians and computer scientists often grapple with the challenge of generating truly random numbers. Most built-in functions, like `Math.random()` in JavaScript, produce **pseudo-random numbers (PRNs)** with uniform distribution [[source](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random)], and Python's `randint()` function is also a PRN generator.

However, PRNs are not truly random, and for certain applications, this limitation can be problematic.

### Enter **TruRand**:  
Human interactions with machines are inherently random. Whether it’s the unpredictable movements of a mouse cursor, the varied speed and frequency of key presses, or even eye movements across a screen—these interactions form our "digital fingerprints," which are unique for users and `truly` random.

**TruRand** leverages this randomness by tracking users' mouse cursor movements and recording the X and Y coordinates to generate **true random numbers**.
