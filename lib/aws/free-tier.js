const getFreeTierAllocation = includeFreeTier => (includeFreeTier ? {
    freeTimePerGbTenthSecond: 400000000,
    freeRequests: 1000000,
} : { freeTimePerGbTenthSecond: 0, freeRequests: 0 });


module.exports = {
    getFreeTier: ({ freeTier = true }) => {
        const remaining = getFreeTierAllocation(freeTier);

        return {
            useTime: (totalExecutionTime, memoryFactor) => {
                const usedExecutionTime = totalExecutionTime * memoryFactor;

                if (!remaining.freeTimePerGbTenthSecond) {
                    return totalExecutionTime;
                }

                if (usedExecutionTime > remaining.freeTimePerGbTenthSecond) {
                    const usedTime = usedExecutionTime - remaining.freeTimePerGbTenthSecond;
                    remaining.freeTimePerGbTenthSecond = 0;
                    return usedTime / memoryFactor;
                }

                remaining.freeTimePerGbTenthSecond -= usedExecutionTime;
                return 0;
            },
            useRequests: (executions) => {
                if (!remaining.freeRequests) {
                    return executions;
                }

                if (executions > remaining.freeRequests) {
                    const usedRequests = executions - remaining.freeRequests;
                    remaining.freeRequests = 0;
                    return usedRequests;
                }

                remaining.freeRequests -= executions;
                return 0;
            },
        };
    },
};
