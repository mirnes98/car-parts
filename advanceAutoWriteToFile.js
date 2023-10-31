const fs = require('fs');
const path = require("path");

/**
 * This functions issues a get request to the Advance Auto vehicles API to get information about the years, makes, and models that it covers.
 */
async function writeMakes() {

    const SOURCEPATH = process.env.ADVANCEPATH + '/years/';

    /**
     * Helper workaround method to have the main method "sleep" to prevent being throttled by the API.
     * @param {int} delay - How many milliseconds to sleep.
     * @returns A promise based on a timeout.
     */
    const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
    const start = Date.now();

    //Get Years
    const getYearsURL = "https://shop.advanceautoparts.com/capi/v30/vehicles/years?type=3";
    /* const yearsResponse = await fetch(getYearsURL);
    const yearsArr = await yearsResponse.json(); */

    //Use this to focus on a certain range of years
    let yearsArr = [];

    for (let i = 2023; i <= 2024; i++) {
        yearsArr.push(i);
    }



    for (let year of yearsArr) {
        let yearStart = Date.now()
        console.log(`Starting year: ${year} at ${yearStart - start} ms`);

        let getMakesURL = "https://shop.advanceautoparts.com/capi/v30/vehicles/makes?type=3&year=" + year;
        let makesResponse = await fetch(getMakesURL);
        let makesArr = await makesResponse.json();

        //Get Makes
        for (let make of makesArr) {

            //Use this to focus on one make
            /* if (make != 'Ford') {
                continue;
            } */

            let makeStart = Date.now()
            make = make.replaceAll('/', '-')
            console.log(`Starting make: ${make} at ${makeStart - start} ms`);
            let getModelsURL = "https://shop.advanceautoparts.com/capi/v30/vehicles/models?type=3&year=" + year + "&make=" + make;
            let modelsResponse = await fetch(getModelsURL);
            let modelsArr = await modelsResponse.json();
            

            //Get Models
            for (let model of modelsArr) {
                model = model.replaceAll('/', '-')
                let getEnginesURL = "https://shop.advanceautoparts.com/capi/v30/vehicles?type=3&year=" + year + "&make=" + encodeURIComponent(make) + "&model=" + encodeURIComponent(model);
                let modelString = model.replaceAll(':',"-").replaceAll(',','-');
                //Setup json file
                let contentFileName = `request-${(year)}-${(make)}-${(modelString)}.json`;


                //Create Folder
                let folderName = SOURCEPATH + year + '/' + make + '/';
                if (!fs.existsSync(folderName)) {
                    fs.mkdir(folderName, { recursive: true }, err => { console.error(err) })
                }

                //if (!fs.existsSync(folderName + contentFileName)) {
                await sleep(400);
                let EnginesResponse = await fetch(getEnginesURL);
                let EnginesArr = await EnginesResponse.json();

                let engineJSON = { request: getEnginesURL, "info": EnginesArr }


                //Write to file
                fs.writeFile(folderName + contentFileName, JSON.stringify(engineJSON), function (error) {
                    if (error) {
                        console.error(error);
                    }
                })
                //}
            }

            let makeEnd = Date.now()
            console.log(`Ending make: ${make} at ${makeEnd - start} ms`);
        }

        let yearEnd = Date.now()
        console.log(`Ending year: ${year} at ${yearEnd - start} ms`);
    }

}

writeMakes();