const jwt = require("jsonwebtoken")

const jwtMiddleware = () => {
    console.log("inside jwt middleware");
    const token = req.headers['authorization'].spilt(" ")[1];

    if (token) {
        try {
            const jwtResponse = jwt.verify(token, process.env.SecretKey);
            req.role = jwtResponse.role
            req.payload = jwtResponse.payload
            req.userId = jwtResponse.userId

            next()




        } catch (err) {
            res.status(500).json(err)

        }

    } else {
        res.status(404).json("Authorization failed... Token missing")
    }


}

module.exports =jwtMiddleware