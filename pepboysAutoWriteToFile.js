const fs = require('fs');
require('dotenv').config()

/**
 * This functions issues a get request to the Pepboys vehicles API to get information about the years, makes, and models that it covers.
 */
async function writeMakes() {

    const SOURCEPATH = process.env.PEPBOYSPATH + '/years/';

    //Spoof requests as coming from Chrome as Postman headers weren't accepted, fill in your own header values from browser of choice
    let headers = new Headers({
        Cookie: "_pxvid=ed3c1596-5aa4-11ee-af1e-3fd941922ff8; __pxvid=edf0c792-5aa4-11ee-b2ad-0242ac120004; hylang=en; ROUTE=.accstorefront-697dfff6d8-4869n; dtCookie=v_4_srv_5_sn_3F4DB2F27A7AFF51E0F6711FBE5AF305_perc_100000_ol_0_mul_1_app-3A7d1a8d8230e8e986_1_rcs-3Acss_0; pby_stores_v3=pcj6MvnamplSoykexpZZxw..hF6ZKAhKLlMlUfxUYOktdwUv2to59Qy3pzSs7TUzPOjCoZIjo_iMNfMvTcho6cqmPZqA_dC6VWfqrhpjW2VARVzWr_5lDfdNUFzdLs_KktjzsRE17d7hYav6hI3orW4nSmLKqItLWzMfBu2FhK46_uiPumCyTlGy4B7mIyR-puFW2vHjiIb3eXzjXBlFhgMujF93j7v3ZL77eHHBOX-bfvT7Q76fT1K28iDGc7Hhm_DyNR8XPtVXqT-zu-oX2Ax3OiHZ5GLO_kPqcNajvG1ZKoCAnyKmvf7CfIWkLGcYG14.; at_check=true; AMCVS_B07B1C8B5330944F0A490D4D%40AdobeOrg=1; AMCV_B07B1C8B5330944F0A490D4D%40AdobeOrg=179643557%7CMCIDTS%7C19635%7CMCMID%7C92132814267120451667627420170098250419%7CMCOPTOUT-1696463983s%7CNONE%7CvVersion%7C5.5.0; mbox=PC#7272c6d8010841be8f738bf28061eb39.34_0#1759701585|session#ba30421d50314f6b8bf5f06103b48023#1696458645; pxcts=53d095d4-6301-11ee-930a-4b67415e0e63; JSESSIONID=256D9B631DEB0778BD04BA165C09B594.accstorefront-697dfff6d8-4869n; _pxhd=k7vmZCOZPhZBtUNwmSCr3YFru4zemVPH3SjoTqX6OdjZ8ldHEgBtXtn8POJkEPaduRKvLH43CIyuMUVOIMnCXA==:t95nJk3ULpqn9pfIxti9Ry2rjcuQzjfW8n7H-oAWpgKGaBB2Mek9p-9oC7EnV2YlvDmxgtlJJPl6FIOoKqxzCP5W8Dn8T-KVEn2/Yejpu4s=",
        "User-Agent": "PostmanRuntime/7.33.0",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "sec-ch-ua": "\"Chromium\"; v=\"116\", \"Not)A;Brand\"; v=\"24\", \"Google Chrome\"; v=\"116\"",
        "sec-ch-ua-mobile": "? 0",
        "sec-ch-ua-platform": "Windows",
        DNT: 1,
        "Upgrade-Insecure-Requests": 1,
        "User-Agent": "Mozilla / 5.0(Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari / 537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "? 1",
        "Sec-Fetch-Dest": "document",
        host: "www.pepboys.com",
    });

    /**
     * Helper workaround method to have the main method "sleep" to prevent being throttled by the API.
     * @param {int} delay - How many milliseconds to sleep.
     * @returns A promise based on a timeout.
     */
    const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
    const start = Date.now();

    let yearsArr = [];

    for (let i = 1962; i <= 2023; i++) {
        yearsArr.push(i);
    }

    //This was the GET URL to get all the years that Pepboys has, but it did not respond well to being called from an IDE.
    //https://www.pepboys.com/ymme/vehicle/years
    /* const getYearsURL = "https://www.pepboys.com/ymme/vehicle/years";
    const yearsResponse = await fetch(getYearsURL, { headers: headers });
    const yearsArr = await yearsResponse.json(); */

    console.log(yearsArr);

    //Get Years
    for (let year of yearsArr) {
        let yearStart = Date.now()
        console.log(`Starting year: ${year} at ${yearStart - start} ms`);
        //https://www.pepboys.com/ymme/vehicle/2023/makes
        let getMakesURL = "https://www.pepboys.com/ymme/vehicle/" + year + "/makes";
        let makesResponse = await fetch(getMakesURL, { headers: headers });
        let makesArr = await makesResponse.json();
        //console.log(makesArr);

        //Get Makes
        for (let makeObj of makesArr) {
            let make = makeObj.name;

            //Use if you need to focus on a particular make.
            /* if(makeObj.name != 'VOLKSWAGEN'){
                continue;
            } */

            let makeId = makeObj.code;
            let makeStart = Date.now()
            make = make.replaceAll('/', '-')

            let makeContentFileName = `request-${(year)}-${(make)}.json`;

            //Create Folder
            let folderName = SOURCEPATH + year + '/' + make + '/';
            if (!fs.existsSync(folderName)) {
                fs.mkdir(folderName, { recursive: true }, err => { console.error(err) })
            }

            let fullMakeFilePath = folderName + makeContentFileName;

            //Write make info to file
            fs.writeFile(fullMakeFilePath, JSON.stringify(makeObj), function (error) {
                if (error) {
                    console.error(error);
                }
            })


            console.log(`Starting make: ${make} at ${makeStart - start} ms`);
            //https://www.pepboys.com/ymme/vehicle/2023/17/models
            let getModelsURL = "https://www.pepboys.com/ymme/vehicle/" + year + "/" + makeId + "/models";
            //await sleep(400);
            let modelsResponse = await fetch(getModelsURL, { headers: headers });
            let modelsArr = await modelsResponse.json();
            //console.log(modelsArr);
            for (let modelObj of modelsArr) {
                await modelObj.name.replace(/\//g, 'ForwardSlash');
            }


            //Get Models
            //https://www.pepboys.com/ymme/vehicle/2023/17/6/engines
            for (let modelObj of modelsArr) {
                let model = modelObj.name;
                let modelId = modelObj.code;
                model = model.replaceAll(':',"-").replaceAll(',','-');
                let getEnginesURL = "https://www.pepboys.com/ymme/vehicle/" + year + "/" + makeId + "/" + modelId + "/engines";

                //Setup json file
                let contentFileName = `request-${(year)}-${(make)}-${(model)}.json`;

                //Some models have colons or commas that aren't allowed in file names. Thanks Volkswagen.
                contentFileName = contentFileName.replaceAll(':',"-").replaceAll(',','-');


                //Create Folder
                let folderName = SOURCEPATH  + year + '/' + make + '/';


                if (!fs.existsSync(folderName + contentFileName)) {
                    await sleep(500);
                    let vehicleResponse = await fetch(getEnginesURL, { headers: headers });
                    let vehiclesArr = await vehicleResponse.json();
                    let vehicleJSON = { request: getEnginesURL };
                    let engineArr = [];

                    for (let engineObj of vehiclesArr) {
                        engineArr.push(engineObj);
                    }
                    
                    vehicleJSON.info = engineArr;

                    //Write to file
                    //console.log(vehicleJSON);
                    fs.writeFile(folderName + contentFileName, JSON.stringify(vehicleJSON), function (error) {
                        if (error) {
                            console.log(error);
                        }
                    })
                }
            }

            let makeEnd = Date.now()
            console.log(`Ending make: ${make} at ${makeEnd - start} ms`);
        }

        let yearEnd = Date.now()
        console.log(`Ending year: ${year} at ${yearEnd - start} ms`);
    }

}

writeMakes();