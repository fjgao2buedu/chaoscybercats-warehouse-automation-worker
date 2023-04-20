module.exports = async function (context, input) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var responseMessage = context.bindings.fileResult[0];
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