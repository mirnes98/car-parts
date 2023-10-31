const fs = require('fs');
const path = require("path");

/**
 * Creates a JSON in the expected database format from the GET request responses from Advance Auto.
 */
function writePepboyToDB() {

    /** @constant {string} */
    const SOURCEPATH = process.env.ADVANCEPATH + '/years';
    /** @constant {string} */
    const DESTPATH = process.env.ADVANCEPATH + '/db/';

    let counter = 19084;

    /**
     * Returns an array of year strings that represent the folders of the Advance Auto GET request responses.
     * @param {string} source - The path to the folder holding the GET request JSONs.
     * @returns {string[]} - Array of year strings that represent the years of makes that Advance Auto covers.
     */
    const getDirectories = source =>
        fs.readdirSync(source)

    let yearsArr = getDirectories(SOURCEPATH)

    for (yearString of yearsArr) {
        //if (yearString == 1963) { break; }
        let yearPath = SOURCEPATH + '/' + yearString;
        console.log(yearsArr)

        let makesArr = getDirectories(yearPath)
        for (makeString of makesArr) {
            let makePath = yearPath + '/' + makeString;
            console.log(makesArr)

            let modelsArr = getDirectories(makePath)
            for (fileString of modelsArr) {
                let filePath = makePath + '/' + fileString;
                console.log(filePath);

                //VW models have hypen, use other method to filter string.
                let makeIndex = fileString.search(makeString);
                let makeEndex = makeIndex + makeString.length;
                let modelString = fileString.substring(makeEndex + 1);
                modelString = modelString.replace('.json', '').replace('json', '')

                if (modelString == "") {
                    continue;
                }

                let fileData = fs.readFileSync(filePath);
                let fileJson = JSON.parse(fileData.toString());

                let requestString = fileJson.request;
                let enginesArr = fileJson.info;

                let dataRecord = {}

                for (engine of enginesArr) {
                    let modelIDString = engine.id;
                    let engineString = engine.engine;
                    let engineCodeString = engine.code;

                    dataRecord = {
                        internalID: counter, recordType: 1, siteID: 1, getRequest: requestString, year: yearString, make: makeString, makeID: null, model: modelString, modelID: modelIDString, engine: engineString, engineID: engineCodeString, recordData: enginesArr
                    }
                    console.log(dataRecord);
                }


                let contentFileName = "advanceRecord" + counter + ".json";

                fs.writeFileSync(DESTPATH + contentFileName, JSON.stringify(dataRecord), function (error) {
                    if (error) {
                        console.log(error);
                    }
                })
                counter++;
            }
        };
    };
}

writePepboyToDB();