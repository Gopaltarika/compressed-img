document.getElementById('imageUpload').addEventListener('change', async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    // Show file size and display the uploaded image
    const fileSizeInKB = (file.size / 1024).toFixed(2);
    const fileSizeElem = document.getElementById('fileSize');
    const previewImg = document.getElementById('uploadedImage');
    const downloadLink = document.getElementById('downloadLink');

    // Display the image
    const reader = new FileReader();
    reader.onload = function (e) {
        previewImg.src = e.target.result;
        previewImg.style.display = 'block';
    };
    reader.readAsDataURL(file);

    // Compress if size is above 35 KB
    if (fileSizeInKB > 30) {  // Compress if size exceeds 35 KB
        const compressedBlob = await compressImage(file);
        const compressedSizeInKB = (compressedBlob.size / 1024).toFixed(2);

        // Show compressed size
        fileSizeElem.textContent = `Original: ${fileSizeInKB} KB, Compressed: ${compressedSizeInKB} KB`;

        // Update image preview
        const compressedURL = URL.createObjectURL(compressedBlob);
        previewImg.src = compressedURL;

        // Set up download link
        const downloadURL = URL.createObjectURL(compressedBlob);
        downloadLink.href = downloadURL;
        downloadLink.style.display = 'inline-block';
    } else {
        fileSizeElem.textContent = `File Size: ${fileSizeInKB} KB (No compression needed)`;
        downloadLink.style.display = 'none';
    }
});

// Function to compress the image with better quality
function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.src = event.target.result;

            img.onload = function () {
                const canvas = document.createElement('canvas');
                const maxWidth = 800; // Larger width to preserve detail
                const maxHeight = 800; // Larger height to preserve detail
                let width = img.width;
                let height = img.height;

                // Maintain aspect ratio
                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    } else {
                        width = (maxHeight / height) * width;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compress image with higher quality (0.85 or higher)
                canvas.toBlob(
                    (blob) => resolve(blob),
                    'image/jpeg',
                    0.68 // Higher compression quality for better image quality
                );
            };
        };
        reader.readAsDataURL(file);
    });
}
