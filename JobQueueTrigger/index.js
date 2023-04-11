const fetch = require('node-fetch')
module.exports = async function (context, myQueueItem) {
    context.log('JavaScript queue trigger function processed work item', myQueueItem);
    const data = { url: myQueueItem };
    const recognizedData = await fetch("https://infinitecats.cognitiveservices.azure.com/computervision/imageanalysis:analyze?features=caption,read&model-version=latest&language=en&api-version=2023-02-01-preview", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': process.env.Ocp_Apim_Subscription_Key
        },
    })
    .then(response => response.json())
    // .then(data => console.log(data))
    // .catch(error => console.error(error));

    context.bindings.outputDocument = recognizedData;
    
    context.log('Document parsed: \n', recognizedData);
};
