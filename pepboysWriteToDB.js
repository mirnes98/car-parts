const fs = require('fs');
require('dotenv').config()

/**
 * Creates a JSON in the expected database format from the GET request responses from Pepboys.
 */
function writePepboyToDB() {

    /** @constant {string} */
    const SOURCEPATH = process.env.PEPBOYSPATH + '/years';
    /** @constant {string} */
    const DESTPATH = process.env.PEPBOYSPATH + '/db/';

    let counter = 0;

    /**
     * Returns an array of year strings that represent the folders of the Pepboys GET request responses.
     * @param {string} source - The path to the folder holding the GET request JSONs.
     * @returns {string[]} - Array of year strings that represent the years of makes that Pepboys covers.
     */
    const getDirectories = source =>
        fs.readdirSync(source)

    let yearsArr = getDirectories(SOURCEPATH)

    for (yearString of yearsArr) {
        //if (yearString == 1963) { break; }
        let yearPath = SOURCEPATH + '/' + yearString;
        //console.log(yearPath)

        let makesArr = getDirectories(yearPath)
        for (makeString of makesArr) {
            let makePath = yearPath + '/' + makeString;

            if (makeString == 'VOLKSWAGEN') {
                console.log(makePath)
            }

            let modelsArr = getDirectories(makePath)
            for (fileString of modelsArr) {
                let filePath = makePath + '/' + fileString;
                //console.log(filePath);

                //VW models have hypen, use other method to filter string.
                let makeIndex = fileString.search(makeString);
                let makeEndex = makeIndex + makeString.length;
                let modelString = fileString.substring(makeEndex + 1);
                modelString = modelString.replace('.json', '').replace('json', '')

                if (modelString == "") {
                    break;
                }

                let fileData = fs.readFileSync(filePath);
                let fileJson = JSON.parse(fileData.toString());

                let requestString = fileJson.request;
                let requestArr = requestString.toString().split("/")
                let enginesArr = fileJson.info;

                let makeIDString = requestArr[6];
                let modelIDString = requestArr[7];
                let dataRecord = {}

                if (enginesArr.length == 0) {
                    dataRecord = {
                        internalID: counter, recordType: 1, siteID: 3, getRequest: fileJson.request, year: yearString, make: makeString, makeID: makeIDString, model: modelString, modelID: modelIDString, engine: null, engineID: null, recordData: enginesArr
                    }
                    console.log(dataRecord);
                }
                else {
                    for (engine of enginesArr) {
                        let engineString = engine.name;
                        let engineIDString = engine.code;

                        dataRecord = {
                            internalID: counter, recordType: 1, siteID: 3, getRequest: fileJson.request, year: yearString, make: makeString, makeID: makeIDString, model: modelString, modelID: modelIDString, engine: engineString, engineID: engineIDString, recordData: enginesArr
                        }
                        console.log(dataRecord);
                    }
                }

                let contentFileName = "pepboysRecord" + counter + ".json";

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