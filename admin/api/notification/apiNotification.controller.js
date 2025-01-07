const Notification = require("../../models/notification.model");

module.exports = {
    getAllCustomer: (req, res) => {},
    notify: (req, res) => {
        // find all notification
        Notification.find({}).then((notifications) => {
            // sort by time
            notifications.sort((a, b) => {
                return new Date(b.time) - new Date(a.time);
            });

            res.status(201).json(notifications);
        });
    },
    updateStatus: async (req, res) => {
        // find all notification
        Notification.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    seen: true,
                },
            },
            { new: true }
        ).then((notifications) => {
            if (!notifications) {
                return res.status(404).json({
                    message: "Notification not found with id " + req.params.id,
                });
            }

            Notification.find({}).then((notifications) => {
                // sort by time
                notifications.sort((a, b) => {
                    return new Date(b.time) - new Date(a.time);
                });
                res.status(201).json(notifications);
            });
        });
    },
};
