/**
 * This function displays a simple progress bar in the console.
 * @param {number} completed The number of items completed.
 * @param {number} total The total number of items.
 * @param {number} [barLength=24] The length (in characters) of the progress bar.
 */
function displayProgressBar(completed, total, barLength = 24) {
  const progress = Math.round((completed / total) * barLength);
  const completedBar = "█".repeat(progress);
  const remainingBar = "█".repeat(barLength - progress);
  const percentage = Math.round((completed / total) * 100);
  const color = percentage < 50 ? "\x1b[31m" : percentage < 75 ? "\x1b[33m" : "\x1b[32m"; // Red, Yellow, Green
  process.stdout.write(`\r${color}${completedBar}\x1b[0m${remainingBar} ${completed}/${total}`);
}

module.exports = {
  displayProgressBar,
};
