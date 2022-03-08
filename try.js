// ['log', 'warn', 'error'].forEach((methodName) => {
// 	const originalMethod = console[methodName];
// 	console[methodName] = (...args) => {
// 		try {
// 			throw new Error();
// 		} catch (error) {
// 			originalMethod.apply(console, [
// 				...args,
// 				'\t\t',
// 				error.stack // Grabs the stack trace
// 					.split('\n')[2] // Grabs third line
// 					.trim() // Removes spaces
// 					.substring(3) // Removes three first characters ("at ")
// 					.replace(__dirname, '') // Removes script folder path
// 					.replace(/\s\(./, ' at ') // Removes first parentheses and replaces it with " at "
// 					.replace(/\)/, ''), // Removes last parentheses
// 			]);
// 		}
// 	};
// });

const fs = require("fs");
const PDFDocument = require("pdfkit");

const doc = new PDFDocument();

doc.pipe(fs.createWriteStream("test.pdf"));

const fillColor = "grey";
const fillOpacity = 0.1;
const x = 0;
const y = 0;
const width = 300;
const height = 300;

doc
  .fill(fillColor)
  // .stroke(fillColor)
  .fillOpacity(fillOpacity)
  .rect(x, y, width, height)
  // .stroke()
  .fill();

doc.fillColor("black").fillOpacity(1).text("Hello", 100, 100);

doc.end();
