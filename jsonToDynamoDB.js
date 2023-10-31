const fs = require('fs');
const path = require("path");
require('dotenv').config()

/**
 * This returns an array of strings that are paths to JSONs holding the vehicle data.
 * @function getArrayJSONPaths
 * @param {string} __dirname - Path to the overall directory that holds the JSONs.
 * @returns {string[]} - Array of path strings to JSON files.
 */
function getArrayJSONPaths(__dirname) {
    let jsonPaths = [];
    let dir = path.join(__dirname, "json");
    fs.readdirSync(__dirname).forEach(file => {
        jsonPaths.push(path.join(__dirname, file));
    });
    return jsonPaths;

}

/**
 * This method directly interacts with the DynamoDB table to put/update the items given to it. It is exptected that the JSON files are in a specific format.
 * @async
 * @function putItemtoTable
 * @param {string[]} arr - Array of path strings to JSON files.
 * @param {AWS.DynamoDB} db - DynamoDB Service Object
 */
async function putItemtoTable(arr, db) {

    for (filepath of arr) {
        let fileData = fs.readFileSync(filepath);
        let fileJson = JSON.parse(fileData.toString());
        let emptyRecord = JSON.stringify(fileJson.recordData) == 0;

        let params = {
            "TableName": "vehicles",
            "Item": {
                "internalID": { "N": fileJson.internalID.toString() },
                "recordType-index": { "N": fileJson.recordType.toString() },
                "siteID-index": { "N": fileJson.siteID.toString() },
                "getRequest": { "S": fileJson.getRequest },
                "year-index": { "N": fileJson.year.toString() },
                "make-index": { "S": fileJson.make },
                "makeID-index": { "N": fileJson.makeID == null ? "0" : fileJson.makeID.toString() },
                "model-index": { "S": fileJson.model },
                "modelID-index": { "N": fileJson.modelID == null ? "0" : fileJson.modelID.toString() },
                "engine-index": { "S": fileJson.engine == null ? "" : fileJson.engine },
                "engineID-index": { "N": fileJson.engineID == null ? "0" : fileJson.engineID.toString() },
                "recordData": { "S": emptyRecord == 0 ? "NULL" : JSON.stringify(fileJson.recordData) }
            }
        }

        try {
            const putObjectResponse = await db.putItem(params).promise();
            console.log("PutItem succeeded:");
            console.log(JSON.stringify(putObjectResponse));
        }
        catch (err) {
            console.log("Unable to update item id:" + fileJson.internalID.toString() + " Error JSON: " + err);
            console.err(err)
        }
        console.log("done with upload id:" + fileJson.internalID.toString())

    }
}

/**
 * Main method that creates the connection to the AWS DynamoDB and starts the process of sending the data items to the DynamoDB table.
 * @function jsonToDynamoTable
 * @param {string} __dirname - Path to folder containing formatted JSON files of vehicle data.
 * @typedef {AWS.DynamoDB} dynamodb - Service object representing connection to DynamoDB table.
 */
function jsonToDynamoTable(__dirname) {
    let AWS = require('aws-sdk');
    AWS.config.update({accessKeyId: process.env.ACCESSKEYID, secretAccessKey: process.env.SECRETACCESSKEY, region: process.env.REGION });
    let dynamodb = new AWS.DynamoDB();

    let jsonPaths = getArrayJSONPaths(__dirname);

    putItemtoTable(jsonPaths, dynamodb);

}

//Use either "ADVANCEPATH", "AUTOZONEPATH", or "PEPBOYSPATH".
jsonToDynamoTable(process.env.PEPBOYSPATH + '/db');