module.exports = async function (context, input) {
    context.bindings.myQueueItem = [input.query.imgurl]; // for testing purpose only. Use the following line for real.
    // context.bindings.myQueueItem = input.body;
    return {
        body: input.query.imgurl
    };
};