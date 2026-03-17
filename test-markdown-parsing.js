/**
 * Test script to demonstrate proper markdown parsing from JSON response
 *
 * Run with: node test-markdown-parsing.js
 */

// Example JSON response from the API (this is what you actually get)
const apiResponse = {
  "status": "true",
  "message": "choice questions generated successfully",
  "data": "Q1. [Medium] According to the text, what is the primary nature of the Christian life?\nA. A period of rest and peace\nB. A journey of personal discovery\nC. A spiritual battleground\nD. A time for learning and contemplation\nAnswer: C\n\nQ2. [Medium] The text states that believers do not fight _for_ victory, but rather fight _from_ victory. What does this imply about the source of their ability to overcome?\nA. Victory is achieved through human effort and determination.\nB. Victory is already secured by Christ's work on our behalf.\nC. Victory is a future hope that motivates present struggles.\nD. Victory depends on the strength of our willpower.\nAnswer: B\n\nQ3. [Medium] The Apostle John's statement, 'For whatsoever is born of God overcometh the world,' suggests that overcoming is:\nA. A potential outcome for diligent believers\nB. A result of consistent prayer\nC. An inherent characteristic of believers\nD. A reward earned through good deeds\nAnswer: C\n\nQ4. [Medium] Which of the following is identified in the text as a source of strength for overcoming challenges in the Christian life?\nA. Personal willpower and determination\nB. The wisdom gained from worldly knowledge\nC. The indwelling Spirit of God\nD. The promises of material wealth\nAnswer: C\n"
};

console.log("=== RAW JSON STRING (shows \\n) ===");
console.log(JSON.stringify(apiResponse.data));
console.log("\n");

console.log("=== PROPERLY PARSED MARKDOWN (shows actual line breaks) ===");
console.log(apiResponse.data);
console.log("\n");

console.log("=== WRITING TO FILE ===");
const fs = require('fs');
fs.writeFileSync('output.md', apiResponse.data, 'utf8');
console.log("✅ Written to output.md - check the file, it should have proper line breaks!");
