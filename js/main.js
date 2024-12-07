// 定义全局变量
let originalFile = null;
let compressedBlob = null;

// 等待页面加载完成后再执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const uploadBox = document.querySelector('.upload-box');
    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const originalImage = document.getElementById('originalImage');
    const compressedImage = document.getElementById('compressedImage');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');

    // 直接绑定点击事件
    uploadBox.addEventListener('click', function(e) {
        e.preventDefault();
        fileInput.click();
        console.log('点击上传区域');
    });

    // 文件选择处理
    fileInput.addEventListener('change', function(e) {
        console.log('选择文件');
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // 处理拖拽
    uploadBox.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadBox.classList.add('dragover');
    });

    uploadBox.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadBox.classList.remove('dragover');
    });

    uploadBox.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadBox.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // 质量滑块变化处理
    qualitySlider.addEventListener('input', function(e) {
        qualityValue.textContent = `${e.target.value}%`;
        if (originalFile) {
            compressImage(originalFile, e.target.value / 100);
        }
    });

    // 下载按钮点击处理
    downloadBtn.addEventListener('click', handleDownload);

    // 设置默认质量值
    qualitySlider.value = 60;
    qualityValue.textContent = '60%';

    // 处理文件选择
    async function handleFileSelect(file) {
        if (!file.type.match('image.*')) {
            alert('请选择图片文件！');
            return;
        }

        originalFile = file;
        displayFileSize(file.size, originalSize);
        
        // 显示原图预览
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // 压缩图片
        await compressImage(file, qualitySlider.value / 100);
        
        // 显示预览区域
        previewArea.style.display = 'grid';
    }

    // 压缩图片
    async function compressImage(file, quality) {
        try {
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1600,
                useWebWorker: true,
                quality: quality,
                fileType: 'image/jpeg'
            };

            compressedBlob = await imageCompression(file, options);
            displayFileSize(compressedBlob.size, compressedSize);

            // 显示压缩后的图片预览
            const reader = new FileReader();
            reader.onload = (e) => {
                compressedImage.src = e.target.result;
            };
            reader.readAsDataURL(compressedBlob);

        } catch (error) {
            console.error('压缩失败:', error);
            alert('图���压缩失败，请重试！');
        }
    }

    // 显示文件大小
    function displayFileSize(bytes, element) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        let i = 0;
        let size = bytes;

        while (size >= 1024 && i < sizes.length - 1) {
            size /= 1024;
            i++;
        }

        element.textContent = `${size.toFixed(2)} ${sizes[i]}`;
    }

    // 处理下载
    function handleDownload() {
        if (!compressedBlob) {
            alert('请先上传并压缩图片！');
            return;
        }

        const link = document.createElement('a');
        link.href = URL.createObjectURL(compressedBlob);
        
        const originalName = originalFile.name;
        const lastDot = originalName.lastIndexOf('.');
        const fileName = originalName.substring(0, lastDot);
        const extension = originalName.substring(lastDot);
        link.download = `${fileName}_compressed${extension}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
});