const crypto = require('crypto');

function verifyMetaSignature(appSecret) {
  return function (req, res, next) {
    if (!appSecret) {
      return next();
    }

    const signature = req.headers['x-hub-signature-256'];

    if (!signature || !req.rawBody) {
      return res.status(401).send('Missing signature');
    }

    const expectedHash = crypto
      .createHmac('sha256', appSecret)
      .update(req.rawBody)
      .digest('hex');

    const expectedSignature = 'sha256=' + expectedHash;

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      return res.status(401).send('Invalid signature');
    }

    next();
  };
}

module.exports = { verifyMetaSignature };