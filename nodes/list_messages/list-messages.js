const responseHandler = require('../../util/catenis-api-response-handler.js');
const util = require('../../util');

module.exports = function(RED) {
    function ListMessagesNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', function(msg) {
            const selector = {
                action: config.action,
                direction: config.direction,
                readState: config.readState
            };
            let limit,
                skip;

            let trimmedStr;
            let fromDeviceIds;
            let toDeviceIds;
            let fromDeviceProdUniqueIds;
            let toDeviceProdUniqueIds;

            if (util.checkNonEmptyStr(trimmedStr = config.fromDeviceIds.trim())) {
                fromDeviceIds = trimmedStr;
            }
            if (util.checkNonEmptyStr(trimmedStr = config.toDeviceIds.trim())) {
                toDeviceIds = trimmedStr;
            }
            if (util.checkNonEmptyStr(trimmedStr = config.fromDeviceProdUniqueIds.trim())) {
                fromDeviceProdUniqueIds = trimmedStr;
            }
            if (util.checkNonEmptyStr(trimmedStr = config.toDeviceProdUniqueIds.trim())) {
                toDeviceProdUniqueIds = trimmedStr;
            }
            if (util.checkNonEmptyStr(trimmedStr = config.startDate.trim())) {
                selector.startDate = trimmedStr;
            }
            if (util.checkNonEmptyStr(trimmedStr = config.endDate.trim())) {
                selector.endDate = trimmedStr;
            }

            if (util.checkIntNumberStr(config.limit)) {
                limit = parseInt(config.limit);
            }
            if (util.checkIntNumberStr(config.skip)) {
                skip = parseInt(config.skip);
            }

            if (util.checkNonNullObject(msg.payload)) {
                if (util.checkNonNullObject(msg.payload.selector)) {
                    if (util.checkNonEmptyStr(msg.payload.selector.action)) {
                        selector.action = msg.payload.selector.action;
                    }
                    if (util.checkNonEmptyStr(msg.payload.selector.direction)) {
                        selector.direction = msg.payload.selector.direction;
                    }
                    if (util.checkNonEmptyStr(msg.payload.selector.fromDeviceIds)) {
                        fromDeviceIds = msg.payload.selector.fromDeviceIds;
                    }
                    if (util.checkNonEmptyStr(msg.payload.selector.toDeviceIds)) {
                        toDeviceIds = msg.payload.selector.toDeviceIds;
                    }
                    if (util.checkNonEmptyStr(msg.payload.selector.fromDeviceProdUniqueIds)) {
                        fromDeviceProdUniqueIds = msg.payload.selector.fromDeviceProdUniqueIds;
                    }
                    if (util.checkNonEmptyStr(msg.payload.selector.toDeviceProdUniqueIds)) {
                        toDeviceProdUniqueIds = msg.payload.selector.toDeviceProdUniqueIds;
                    }
                    if (util.checkNonEmptyStr(msg.payload.selector.startDate)) {
                        selector.startDate = msg.payload.selector.startDate;
                    }
                    if (util.checkNonEmptyStr(msg.payload.selector.endDate)) {
                        selector.endDate = msg.payload.selector.endDate;
                    }
                }

                if (util.checkNumber(msg.payload.limit)) {
                    limit = msg.payload.limit;
                }
                if (util.checkNumber(msg.payload.skip)) {
                    skip = msg.payload.skip;
                }
            }

            let fromDevices = [];

            if (fromDeviceIds) {
                fromDevices = fromDevices.concat(fromDeviceIds.split(',').map(function (id) {
                    return {
                        id: id
                    };
                }));
            }
            if (fromDeviceProdUniqueIds) {
                fromDevices = fromDevices.concat(fromDeviceProdUniqueIds.split(',').map(function (id) {
                    return {
                        id: id,
                        isProdUniqueId: true
                    };
                }));
            }

            if (fromDevices.length > 0) {
                selector.fromDevices = fromDevices;
            }

            let toDevices = [];

            if (toDeviceIds) {
                toDevices = toDevices.concat(toDeviceIds.split(',').map(function (id) {
                    return {
                        id: id
                    };
                }));
            }
            if (toDeviceProdUniqueIds) {
                toDevices = toDevices.concat(toDeviceProdUniqueIds.split(',').map(function (id) {
                    return {
                        id: id,
                        isProdUniqueId: true
                    };
                }));
            }

            if (toDevices.length > 0) {
                selector.toDevices = toDevices;
            }

            const connection = RED.nodes.getNode(config.connection);
            const ctnApiClient = connection.ctnApiClient;

            ctnApiClient.listMessages(selector, limit, skip, responseHandler.bind(node, msg));
        });
    }

    RED.nodes.registerType("list messages", ListMessagesNode);

    RED.httpAdmin.post("/catenis.listmessages/:id", RED.auth.needsPermission("catenis.listmessages"), function(req, res) {
        const node = RED.nodes.getNode(req.params.id);
        if (node != null) {
            try {
                node.receive();
                res.sendStatus(200);
            } catch(err) {
                res.sendStatus(500);
                node.error("Error sending message to node component in response to catenis.listmessages/:id request: " + err);
            }
        } else {
            res.sendStatus(404);
        }
    });
}

