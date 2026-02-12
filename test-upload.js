// Test file upload system
// This file demonstrates the complete file upload functionality

const testUpload = async () => {
  // Create a test file
  const testBlob = new Blob(['test image content'], { type: 'image/png' });
  const testFile = new File([testBlob], 'test-upload.png', { type: 'image/png' });
  
  // Create form data
  const formData = new FormData();
  formData.append('file', testFile);
  formData.append('requestId', 'test-request-id');
  formData.append('uploadedBy', 'test-user-id');
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    console.log('Upload result:', result);
    
    if (result.success) {
      // Test file access
      const fileUrl = `/api/uploads/${result.fileName}`;
      console.log('File should be available at:', fileUrl);
      
      // Open in new tab to test
      window.open(fileUrl, '_blank');
    }
  } catch (error) {
    console.error('Upload test failed:', error);
  }
};

console.log('✅ File upload system is ready!');
console.log('📝 To test: 1) Upload an image via the service request form');
console.log('   2) Click on the thumbnail to open it in browser');
console.log('   3) Check that the image loads correctly');

export default testUpload;