import cloudinary from './src/config/cloudinary.js'

const tinyPngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='

const run = async () => {
  try {
    console.log('Using cloud name:', process.env.CLOUDINARY_CLOUD_NAME)
    const res = await cloudinary.uploader.upload(tinyPngBase64, {
      folder: 'erica-spanks/test',
      use_filename: true,
      unique_filename: true,
      resource_type: 'image'
    })
    console.log('Upload succeeded:', res.secure_url)
  } catch (err) {
    console.error('Upload failed:', err && (err.message || err))
    if (err && err.http_code) console.error('HTTP code:', err.http_code)
    if (err && err.error) console.error('Cloudinary error:', err.error)
    process.exit(1)
  }
}

run()
