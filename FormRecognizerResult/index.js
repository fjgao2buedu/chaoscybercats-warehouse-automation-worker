module.exports = async function (context, input) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var response = context.bindings.fileResult

    // if (!response.length) { return { body: [{"content":"empty"}] } }
    if (!response.length) { return { body: { warning: "file not found, check filename or try again in 30 seconds." } } }

    var responseMessage = response[0];
    for (let key in responseMessage) {
        if (key.match(/^\_/)) {
            delete responseMessage[key];
        }
    }

    context.log('JavaScript HTTP trigger function returns a response: ', responseMessage);

    return {
        body: responseMessage
    };
}