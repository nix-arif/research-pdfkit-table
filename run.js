const fs = require('fs');
const PDFDocument = require('./index');

const doc = new PDFDocument();

doc.pipe(fs.createWriteStream('test.pdf'));

// try {
//   doc.tables([
//     {
//       name: "arif",
//       headers: ["name", "age"],
//       options: {
//         padding: 0,
//       },
//       // datas: ["data1", "data2"],
//       rows: [["row1 is a row1 is a row1", "row2"]],
//     },
//   ]);
// } catch (error) {
//   console.log(error);
// }

const table = {
	headers: ['name', 'age'],
	rows: [['row1', 'row2']],
	addPage: true,
};

doc.table(table, {
	// prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
});

doc.end();

// headers: [
//   {
//     label: "name",
//     padding: [0, 0, 0, 0],
//   },
// ],
