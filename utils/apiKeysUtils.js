const crypto=require("crypto")


function generateApiKey(){
    const randomBytes=crypto.randomBytes(32).toString('hex')
    const rawKey=`sk_live_${randomBytes}`;

    const keyHash =crypto.createHash('sha256').update(rawKey).digest("hex");

    const prefix =rawKey.substring(0, 16) + '...';

    return {rawKey,keyHash,prefix};
}

// Hashes an incomming raw key from request headers to check against DB.

function hashApikey(rawKey){
    return crypto.createHash('sha256').update(rawKey).digest('hex');
}

module.exports ={generateApiKey,hashApikey};