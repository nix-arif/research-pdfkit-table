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

// // test

// let a = 10;
// let b = 10;

// const knowObjects = new Map();
// const generate = function* () {
// 	while (true) {
// 		let random = Math.random().toString(16).slice(2, 8);
// 		yield `0x${random}`;
// 	}
// };

// const generator = generate();

// const refs = {};

// const findRef = (object) => {
// 	let address;
// 	if (knowObjects.has(object)) {
// 		address = knowObjects.get(object);
// 	} else {
// 		address = generator.next().value;
// 		knowObjects.set(object, address);
// 		refs[address] = object;
// 	}
// 	return address;
// };

// const person1 = {
// 	name: 'name',
// 	age: '23',
// };

// const person2 = {
// 	name: 'name',
// 	age: '23',
// };

// const reference1 = findRef(person1);
// const reference2 = findRef(person2);

// console.log(reference1);
// console.log(reference2);

let a = "A7Bga71";
a = String(a).replace(/[^0-9]/g, "");
console.log(a);

a = [0, 1, 2];
const b = a.reduce((prev, curr, indx) => {
  console.log(prev);
  return prev + curr;
}, 0);
console.log(b);
