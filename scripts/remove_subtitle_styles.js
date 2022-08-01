const fs = require("fs");

const files = fs.readdirSync("./");

files.forEach(filePath => {

	const fileData = fs.readFileSync(filePath, "utf-8");

	let fileDataModified = fileData.replace(/.+?OP -.*\r?\n/g, "")
	fileDataModified = fileDataModified.replace(/.+?ED -.*\r?\n/g, "");
	
	fs.writeFileSync(filePath, fileDataModified, "utf-8");
});