const fetch = require('node-fetch')
module.exports = async function (context, myQueueItem) {
    context.log('JavaScript queue trigger function processed work item', myQueueItem);
    const data = { urlSource: myQueueItem };
    const computer_vision = "https://infinitecats.cognitiveservices.azure.com/computervision/imageanalysis:analyze?features=caption,read&model-version=latest&language=en&api-version=2023-02-01-preview";
    const form_recognizer = "https://infinitechaoscats.cognitiveservices.azure.com/formrecognizer/documentModels/prebuilt-read:analyze?api-version=2022-08-31";
    
    const analyzeOperation = await fetch(form_recognizer, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': process.env.Form_Recognizer_Ocp_Apim_Subscription_Key
        },
    })
    .then(response => response.headers.get('operation-location'))
    // .then(data => console.log(data))
    // .catch(error => console.error(error));

    // const analyzeOperation = "https://infinitechaoscats.cognitiveservices.azure.com/formrecognizer/documentModels/prebuilt-read/analyzeResults/5e3a1880-306c-4b80-90e3-2820dba63041?api-version=2022-08-31";
    context.log('Get response from:', analyzeOperation )

    await new Promise(r => setTimeout(r, 5000));
    const result = await fetch(analyzeOperation, {
        method: 'GET',
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.Form_Recognizer_Ocp_Apim_Subscription_Key
        },
    })
        .then(response => response.json())
    const lines = result.analyzeResult.pages.map(page => page.lines.map(line => line.content.split(":").map(part => part.trim()))).reduce((acc, list) => acc.concat(list));
    // context.log('lines: \n', lines )

    const parsedContent = {};
    let attr_to_combine_multiple_paragraph = lines[0][0];
    lines.forEach((parts) => {
        if (parts.length > 1) {
            attr_to_combine_multiple_paragraph = parts[0]
            parsedContent[parts[0]] = parts.slice(1, parts.length).join(", ")
        } else {
            parsedContent[attr_to_combine_multiple_paragraph] = parsedContent[attr_to_combine_multiple_paragraph] + " " + parts[0]
        }
    });
    context.log('Document parsed: \n', parsedContent );

    context.bindings.outputDocument = parsedContent;
    // =================

    // context.log('Document parsed: \n', recognizedData);

    // const data = { url: myQueueItem };
    // const recognizedData = await fetch("https://infinitecats.cognitiveservices.azure.com/computervision/imageanalysis:analyze?features=caption,read&model-version=latest&language=en&api-version=2023-02-01-preview", {
    //     method: 'POST',
    //     body: JSON.stringify(data),
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Ocp-Apim-Subscription-Key': process.env.Ocp_Apim_Subscription_Key
    //     },
    // })
    // .then(response => response.json())
    // // .then(data => console.log(data))
    // // .catch(error => console.error(error));

    // context.bindings.outputDocument = recognizedData;

    // context.log('Document parsed: \n', recognizedData);
};
