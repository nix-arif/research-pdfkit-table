const fs = require("fs");
const PDFDocument = require("./index");

const doc = new PDFDocument();

doc.pipe(fs.createWriteStream("test.pdf"));

doc.text("Hello");
try {
  doc.tables([{ name: "arif", headers: ["name", "age"] }]);
} catch (error) {
  console.log(error);
}

doc.end();
