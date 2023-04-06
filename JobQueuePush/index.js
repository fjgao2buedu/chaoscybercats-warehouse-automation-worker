module.exports = async function (context, input) {
    context.bindings.myQueueItem = ["input.body","test"]; // for testing purpose only. Use the following line for real.
    // context.bindings.myQueueItem = input.body;
    return {
        body: "things pushed to queue"
    };
};