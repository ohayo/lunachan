const generalUtils = {
    formatBytes(bytes) {
        if (bytes === 0) {
            return '0 Bytes';
        }
      
        const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const base = 1024;
        const decimalPlaces = 2;
        const size = Math.floor(Math.log(bytes) / Math.log(base));
        const formattedSize = parseFloat((bytes / Math.pow(base, size)).toFixed(decimalPlaces));
      
        return `${formattedSize} ${units[size]}`;
    }
};

export default generalUtils;