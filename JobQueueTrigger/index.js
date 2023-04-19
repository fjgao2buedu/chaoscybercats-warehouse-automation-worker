const fetch = require('node-fetch')
module.exports = async function (context, myQueueItem) {
    context.log('JavaScript queue trigger function processed work item', myQueueItem);
    const pattern = /.+\/imgpdfs\/(.+)/;
    const filename = myQueueItem.match(pattern)[1];
    context.log('filename:', filename);
    
    // Code that calls the image api and reads the response
    // computer vision resource
    const computer_vision = "https://infinitecats.cognitiveservices.azure.com/computervision/imageanalysis:analyze?features=caption,read&model-version=latest&language=en&api-version=2023-02-01-preview";
    // form recognizer resource
    const form_recognizer = "https://infinitechaoscats.cognitiveservices.azure.com/formrecognizer/documentModels/prebuilt-read:analyze?api-version=2022-08-31";

    // data input format for form recognizer
    const data = { urlSource: myQueueItem };
    // submitting job to analyze, return operation-location url
    const operation_location = await fetch(form_recognizer, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': process.env.Form_Recognizer_Ocp_Apim_Subscription_Key
        },
    })
        .then(response => response.headers.get('operation-location'))
        .catch(error => console.error(error));
    context.log('operation-location:', operation_location)

    // fetch operation status until succeed
    // TODO: What if never succeed?
    do {
        var result = await fetch(operation_location, {
            method: 'GET',
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.Form_Recognizer_Ocp_Apim_Subscription_Key
            },
        })
            .then(response => response.json());
        await new Promise(r => setTimeout(r, 1000));
    } while (result.status !== "succeeded")
    context.log('operation status:', result.status);
    // End of Code that calls the image api and reads the response

    // parse analyzeResult to lines of words
    const lines = result.analyzeResult.pages.map(page => page.lines.map(line => line.content.split(":").map(part => part.trim()))).reduce((acc, list) => acc.concat(list));
    context.log('lines: \n', lines )

    // begin parse lines to key value pairs
    const parsedContent = {};
    let attr_to_combine_multiple_paragraph = lines[0][0];
    lines.forEach((parts) => {
        if (parts.length > 1) {
            attr_to_combine_multiple_paragraph = parts[0]
            parsedContent[parts[0]] = parts.slice(1, parts.length).join(", ")
        } else {
            // in this case, the item is a continuos part of the previous value
            parsedContent[attr_to_combine_multiple_paragraph] = parsedContent[attr_to_combine_multiple_paragraph] + " " + parts[0]
        }
    });
    parsedContent['ShipperID'] = filename;
    context.log('Document parsed: \n', parsedContent );

    // Code that inserts text into the database.
    context.bindings.outputDocument = parsedContent;
};
