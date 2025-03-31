/**
 * Generates a 6-character unique ID with 2 letters followed by 4 numbers
 * @returns {string} A 6-character unique ID (e.g., "AB1234")
 */
const generateUniqueId = () => {
    // Generate 2 random uppercase letters
    const letters = Array.from({ length: 2 }, () => 
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    
    // Generate 4 random numbers
    const numbers = Array.from({ length: 4 }, () => 
        Math.floor(Math.random() * 10)
    ).join('');
    
    // Combine letters and numbers
    return `${letters}${numbers}`;
};

module.exports = generateUniqueId; 