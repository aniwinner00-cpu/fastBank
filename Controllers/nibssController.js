const nibssService = require("../services/nibssService");

const loginToNibss = async (req, res) => {
    try {
        const token = await nibssService.loginNibss();

        res.status(200).json({
            message: "NIBSS login successful",
            token
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    loginToNibss
};