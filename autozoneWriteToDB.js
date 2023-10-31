const fs = require('fs');
require('dotenv').config()

/**
 * Creates a JSON in the expected database format from the GET request responses from Autozone.
 */
function writePepboyToDB() {

    /** @constant {string} */
    const SOURCEPATH = process.env.AUTOZONEPATH + '/years';
    /** @constant {string} */
    const DESTPATH = process.env.AUTOZONEPATH + '/db/';

    let counter = 83838;

    /**
     * Returns an array of year strings that represent the folders of the Autozone GET request responses.
     * @param {string} source - The path to the folder holding the GET request JSONs.
     * @returns {string[]} - Array of year strings that represent the years of makes that Autozone covers.
     */
    const getDirectories = source =>
        fs.readdirSync(source)

    //Create array of year strings from the existing folders
    let yearsArr = getDirectories(SOURCEPATH)

    for (yearString of yearsArr) {
        //Use below code to test just a single year
        //if (yearString == 1963) { break; }
        let yearPath = SOURCEPATH + '/' + yearString;
        console.log(yearsArr)

        //Create array of make strings
        let makesArr = getDirectories(yearPath)
        for (makeString of makesArr) {
            let makePath = yearPath + '/' + makeString;
            console.log(makesArr)

            //Create array of model strings
            let modelsArr = getDirectories(makePath)
            for (fileString of modelsArr) {
                let filePath = makePath + '/' + fileString;
                console.log(filePath);

                //VW models have hypens, use other method to filter string.
                //Pull the model name out from the filename
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
                let modelIDString = requestString.substring(requestString.lastIndexOf('/') + 1)

                let dataRecord = {}

                for (engine of enginesArr) {
                    let engineString = engine.engine;
                    let engineCodeString = engine.engineID;

                    dataRecord = {
                        internalID: counter, recordType: 1, siteID: 2, getRequest: requestString, year: yearString, make: makeString, makeID: null, model: modelString, modelID: modelIDString, engine: engineString, engineID: engineCodeString, recordData: enginesArr
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