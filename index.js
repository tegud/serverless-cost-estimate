const providerEstimaters = require("./lib/providers");

module.exports = {
    estimate: ({
        provider = "aws",
        ...args
    }) => providerEstimaters[provider].estimate({ ...args }),
};
