import * as Minio from 'minio';
import * as crypto from 'crypto'

// Set up the MinIO client
const minioClient = new Minio.Client({
  endPoint: 'localhost', // MinIO server address (localhost or MinIO host)
  port: 9000, // MinIO server port (default is 9000)
  useSSL: false, // Set to true if using SSL
  accessKey: '1QZzlvg0socBa3lWbVjP', // Your MinIO access key
  secretKey: 'hhDiKrCia8VUTU3yUEQtBsE5faCVHiJdoOO0v5WE', // Your MinIO secret key
});

// Function to upload a file to a MinIO bucket
export async function uploadFile(buffer: Buffer, bucketName: string = 'attachments'): Promise<string> {
  try {
    // Check if the bucket exists, if not, create it
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, 'us-east-1'); // Create the bucket
      console.log(`Bucket ${bucketName} created`);
    }
    let objectName = getFileHash(buffer)
    // Upload the file
    await minioClient.putObject(bucketName, objectName, buffer);
    console.log(`File ${objectName} uploaded to ${bucketName}`);
    return objectName
    
  } catch (err) {
    console.error('Error uploading file:', err);
    throw err
  }
}

function getFileHash(buffer: Buffer, algorithm = 'sha256'){
  const hash = crypto.createHash(algorithm)
  hash.update(buffer);
  return hash.digest('hex');
}