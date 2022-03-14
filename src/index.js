var AWS = require('aws-sdk')
const handle = async ctx => {
  const config = ctx.getConfig('picBed.jdcloud')

  if (!config) {
    console.log('CONFIG_NOT_FOUND_ERROR')
    return ctx
  }
  const { accessKey, secretKey, url, bucket, area, path } = config
  var s3 = new AWS.S3({ apiVersion: '2006-03-01' })
  s3.endpoint = `https://s3.${area}.jdcloud-oss.com`
  s3.config.update({
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
    s3ForcePathStyle: true,
    area,
    signatureVersion: 'v4'
  })

  let output = ctx.output

  for (let i in output) {
    var fileName = `${path}${output[i].fileName}`
    var params = {
      Body: output[i].buffer,
      Bucket: bucket,
      ContentType: 'image/jpeg',
      Key: fileName
    }
    await s3.putObject(params, function (err, data) {
      if (err) console.log(err)
      if (!err) {
        output[i].imgUrl = `${url}/${fileName}`
        // console.log(`https://${bucket}.s3.${area}.jdcloud-oss.com/${fileName}`)
      }
    }).promise()
  }
  return ctx
}

module.exports = ctx => {
  const register = () => {
    ctx.helper.uploader.register('jdcloud', { handle })
  }
  return {
    register,
    uploader: 'jdcloud'
  }
}
