const { getFreeTier } = require("./free-tier");

const roundUpToNearestTenthOfSecond = timeInMs => Math.ceil(timeInMs / 100) * 10;

const chargePerGbTenthSecond = 0.0000001667;
const costPerExecution = 0.0000002;

const getCostCalculators = freeTier => ({
    calculateTimeCost: (executions, memory, executionTime) => {
        const memoryFactor = (memory / 1024);
        const perTenthSecond = chargePerGbTenthSecond * memoryFactor;
        const totalExecutionTime = freeTier.useTime((executions * executionTime), memoryFactor);
        const chargeableTime = roundUpToNearestTenthOfSecond(totalExecutionTime);

        if (chargeableTime < 0) {
            return 0;
        }

        return chargeableTime * perTenthSecond;
    },
    calculateRequestCost: (executions) => {
        const executionsOverFreeTier = freeTier.useRequests(executions);

        if (executionsOverFreeTier < 0) {
            return 0;
        }

        return costPerExecution * executionsOverFreeTier;
    },
});

const estimateFunctionCosts = (freeTier, {
    executions,
    executionTime,
    memory,
}) => {
    const currency = "$";

    const calculators = getCostCalculators(freeTier);
    const totalCost = Object.keys(calculators)
        .reduce((total, name) => total
            + calculators[name](executions, memory, executionTime), 0);

    return {
        currency,
        total: parseFloat(totalCost.toFixed(2)),
    };
};

const precisionRound = (number, precision) => {
    const factor = 10 ** precision;
    return Math.round(number * factor) / factor;
};


module.exports = {
    estimate: (functionDetails) => {
        const freeTier = getFreeTier(functionDetails);

        if (!functionDetails.functions) {
            return estimateFunctionCosts(freeTier, functionDetails);
        }

        const functionCosts = functionDetails.functions.reduce((all, current) => {
            all[current.name] = estimateFunctionCosts(freeTier, {
                ...current,
                freeTier: functionDetails.freeTier,
            }).total;

            return all;
        }, {});

        return {
            functionCosts,
            total: precisionRound(Object.keys(functionCosts)
                .reduce((total, functionName) => total + functionCosts[functionName], 0), 2),
            currency: "$",
        };
    },
};
